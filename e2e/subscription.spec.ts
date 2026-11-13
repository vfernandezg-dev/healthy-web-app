import { expect, test } from './support/test';
import { expectNoA11yViolations } from './support/a11y';
import { mockApi, problem } from './support/api';

const PLANS = [
  {
    id: 'p1',
    tier: 'BASIC',
    name: 'Básico',
    description: 'Metas, pesajes, hábitos, rachas y comunidad.',
    price: { amount: '0.00', currency: 'USD' },
    periodDays: 30,
  },
  {
    id: 'p2',
    tier: 'PREMIUM',
    name: 'Premium',
    description: 'Todo lo del plan Básico, más el contenido premium.',
    price: { amount: '5.99', currency: 'USD' },
    periodDays: 30,
  },
  {
    id: 'p3',
    tier: 'VIP',
    name: 'VIP',
    description: 'Todo lo de Premium, más lo exclusivo VIP.',
    price: { amount: '9.99', currency: 'USD' },
    periodDays: 30,
  },
];
const BASIC = {
  tier: 'BASIC',
  subscriptionId: null,
  status: null,
  currentPeriodEnd: null,
  renews: false,
};
const PREMIUM_ACTIVE = {
  tier: 'PREMIUM',
  subscriptionId: 's1',
  status: 'ACTIVE',
  currentPeriodEnd: '2026-12-12T15:00:00Z',
  renews: true,
};
const NO_PAYMENTS = { content: [], page: { size: 10, number: 0, totalElements: 0, totalPages: 0 } };
const PAYPAL = 'https://www.sandbox.paypal.com/checkoutnow?token=ORDER-1';

test.describe('suscripción', () => {
  test('un cliente básico ve los planes y va a PayPal a pagar', async ({ page }) => {
    let checkout: unknown;
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/subscription-plans': (route) => route.fulfill({ json: PLANS }),
        '/me/subscription': (route) => route.fulfill({ json: BASIC }),
        '/me/payments?*': (route) => route.fulfill({ json: NO_PAYMENTS }),
        '/me/subscription/checkout': (route) => {
          checkout = route.request().postDataJSON();
          return route.fulfill({ json: { approvalUrl: PAYPAL } });
        },
      },
    });
    await page.route('https://www.sandbox.paypal.com/**', (route) =>
      route.fulfill({ contentType: 'text/html', body: '<title>PayPal</title><h1>PayPal</h1>' }),
    );

    await page.goto('/client/subscription');
    await expect(page.getByRole('heading', { level: 2, name: 'Tu plan' })).toBeVisible();
    await expect(page.getByText('El plan gratuito')).toBeVisible();
    await expect(page.getByText('5,99 US$')).toBeVisible();
    await expect(page.getByText('Gratis')).toBeVisible();
    await expect(page.getByText('Aún no has hecho ningún pago')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Suscribirme a Básico' })).toHaveCount(0);
    await expectNoA11yViolations(page);

    await page.getByRole('button', { name: 'Suscribirme a Premium' }).click();

    await expect(page).toHaveURL(PAYPAL);
    expect(checkout).toEqual({ tier: 'PREMIUM' });
  });

  test('no manda a pagar a una dirección que no sea de PayPal', async ({ page }) => {
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/subscription-plans': (route) => route.fulfill({ json: PLANS }),
        '/me/subscription': (route) => route.fulfill({ json: BASIC }),
        '/me/payments?*': (route) => route.fulfill({ json: NO_PAYMENTS }),
        '/me/subscription/checkout': (route) =>
          route.fulfill({ json: { approvalUrl: 'https://paypal.com.evil.example/pay' } }),
      },
    });

    await page.goto('/client/subscription');
    await page.getByRole('button', { name: 'Suscribirme a VIP' }).click();

    await expect(page.getByText('La dirección de pago no es de PayPal.')).toBeVisible();
    await expect(page).toHaveURL(/\/client\/subscription$/);
  });

  test('a la vuelta de PayPal cobra el pedido y confirma el plan', async ({ page }) => {
    let captured: unknown;
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/me/subscription/checkout/capture': (route) => {
          captured = route.request().postDataJSON();
          return route.fulfill({ json: PREMIUM_ACTIVE });
        },
      },
    });

    await page.goto('/client/subscription/checkout/return?token=ORDER-1&PayerID=PAYER');

    await expect(page.getByRole('heading', { level: 1, name: 'Ya tienes Premium' })).toBeVisible();
    await expect(page.getByText('12 de diciembre de 2026')).toBeVisible();
    expect(captured).toEqual({ orderId: 'ORDER-1' });
    await expectNoA11yViolations(page);
  });

  test('si el cobro falla, lo explica', async ({ page }) => {
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/me/subscription/checkout/capture': (route) =>
          route.fulfill(problem(422, 'order-not-approved', 'PayPal no ha aprobado el pago.')),
      },
    });

    await page.goto('/client/subscription/checkout/return?token=ORDER-2');

    await expect(
      page.getByRole('heading', { level: 1, name: 'No se ha podido completar el pago' }),
    ).toBeVisible();
    await expect(page.getByText('PayPal no ha aprobado el pago.')).toBeVisible();
  });

  test('cancelar el pago en PayPal no cobra nada', async ({ page }) => {
    await mockApi(page, { session: 'CLIENT' });
    await page.goto('/client/subscription/checkout/cancel?token=ORDER-3');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Has cancelado el pago' }),
    ).toBeVisible();
    await expectNoA11yViolations(page);
  });

  test('con una suscripción activa, la puede cancelar tras confirmarlo', async ({ page }) => {
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/subscription-plans': (route) => route.fulfill({ json: PLANS }),
        '/me/subscription': (route) => route.fulfill({ json: PREMIUM_ACTIVE }),
        '/me/payments?*': (route) =>
          route.fulfill({
            json: {
              content: [
                {
                  id: 'pay1',
                  subscriptionId: 's1',
                  amount: { amount: '5.99', currency: 'USD' },
                  status: 'CAPTURED',
                  createdAt: '2026-11-12T15:00:00Z',
                  capturedAt: '2026-11-12T15:01:00Z',
                },
              ],
              page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
            },
          }),
        '/me/subscription/cancel': (route) =>
          route.fulfill({ json: { ...PREMIUM_ACTIVE, status: 'CANCELED', renews: false } }),
      },
    });

    await page.goto('/client/subscription');
    await expect(
      page.getByText('Activa: tienes acceso hasta el 12 de diciembre de 2026.'),
    ).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Pagado' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Suscribirme a VIP' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Suscribirme a Premium' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Cancelar la suscripción' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Cancelar la suscripción' });
    await expect(dialog).toContainText(
      'Mantendrás el acceso Premium hasta el 12 de diciembre de 2026.',
    );
    await expectNoA11yViolations(page);
    await dialog.getByRole('button', { name: 'Cancelar la suscripción' }).click();

    await expect(
      page.getByText('Cancelada: mantienes el acceso hasta el 12 de diciembre de 2026.'),
    ).toBeVisible();
  });
});
