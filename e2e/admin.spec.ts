import { type Page, type Route, expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';
import { type Schemas, mockApi, problem, requestBody, sessionFor } from './support/api';

type Params = Record<string, string>;

function paramsOf(route: Route): Params {
  return Object.fromEntries(new URL(route.request().url()).searchParams);
}

function paged<T>(content: T[], size = 20) {
  return {
    content,
    page: {
      size,
      number: 0,
      totalElements: content.length,
      totalPages: content.length ? 1 : 0,
    },
  };
}

async function choose(page: Page, combobox: string, option: string): Promise<void> {
  await page.getByRole('combobox', { name: combobox }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
  await expect(page.getByRole('listbox')).toBeHidden();
}

test.describe('administración: usuarios', () => {
  test('filtra, ordena, desactiva y reactiva cuentas', async ({ page, isMobile }) => {
    const admin = sessionFor('ADMIN').user;
    const user = (id: string, overrides: Record<string, unknown> = {}) => ({
      id,
      firstName: 'Nombre',
      lastName: id,
      email: `${id}@correo.com`,
      role: 'CLIENT',
      status: 'ACTIVE',
      createdAt: '2026-10-01T10:00:00Z',
      lastLoginAt: '2026-11-10T14:00:00Z',
      ...overrides,
    });
    let users = [
      user(admin.id, {
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: 'ADMIN',
      }),
      user('maria', { firstName: 'María', lastName: 'López' }),
      user('carlos', { firstName: 'Carlos', lastName: 'García', role: 'NUTRITIONIST' }),
      user('pedro', {
        firstName: 'Pedro',
        lastName: 'Gómez',
        status: 'DEACTIVATED',
        lastLoginAt: null,
      }),
    ];
    const queries: Params[] = [];
    const setStatus = (id: string, status: string) => {
      users = users.map((u) => (u.id === id ? { ...u, status } : u));
      return users.find((u) => u.id === id);
    };
    await mockApi(page, {
      session: 'ADMIN',
      routes: {
        '/admin/users?*': (route) => {
          const params = paramsOf(route);
          queries.push(params);
          const found = users.filter(
            (u) =>
              (!params['role'] || u.role === params['role']) &&
              (!params['status'] || u.status === params['status']) &&
              (!params['q'] ||
                `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(params['q'])),
          );
          return route.fulfill({ json: paged(found) });
        },
        '/admin/users/maria/deactivate': (route) =>
          route.fulfill({ json: setStatus('maria', 'DEACTIVATED') }),
        '/admin/users/pedro/activate': (route) =>
          route.fulfill({ json: setStatus('pedro', 'ACTIVE') }),
      },
    });

    await page.goto('/admin/users');
    const rows = page.getByRole('row').filter({ hasText: '@' });
    await expect(rows).toHaveCount(4);
    await expect(page.getByText('4 cuentas')).toBeVisible();
    await expect(rows.filter({ hasText: admin.email })).toContainText('Tu cuenta');
    await expect(rows.filter({ hasText: 'Pedro Gómez' })).toContainText('Desactivada');
    await expect(rows.filter({ hasText: 'Pedro Gómez' })).toContainText('Nunca');
    expect(queries[0]).toEqual({ page: '0', size: '20', sort: 'createdAt,desc' });
    // Una sola petición al cargar: la tabla no la repite al montarse (onLazyLoad, orden inicial).
    expect(queries).toHaveLength(1);
    await expectNoA11yViolations(page);

    await page.getByRole('button', { name: 'Desactivar la cuenta de María López' }).click();
    await page
      .getByRole('alertdialog', { name: 'Desactivar la cuenta' })
      .getByRole('button', { name: 'Desactivar' })
      .click();
    await expect(page.getByText('Cuenta desactivada')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Reactivar la cuenta de María López' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Reactivar la cuenta de Pedro Gómez' }).click();
    await expect(page.getByText('Cuenta reactivada')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Desactivar la cuenta de Pedro Gómez' }),
    ).toBeVisible();

    await choose(page, 'Rol', 'Nutricionistas');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Carlos García');
    expect(queries.at(-1)).toEqual({
      page: '0',
      size: '20',
      sort: 'createdAt,desc',
      role: 'NUTRITIONIST',
    });

    await choose(page, 'Rol', 'Todos los roles');
    await page.getByRole('searchbox', { name: 'Buscar cuentas' }).fill('lópez');
    await expect(rows).toHaveCount(1);
    expect(queries.at(-1)?.['q']).toBe('lópez');

    if (!isMobile) {
      await page.getByRole('columnheader', { name: 'Cuenta' }).click();
      await expect.poll(() => queries.at(-1)?.['sort']).toBe('lastName,asc');
    }
  });
});

test.describe('administración: invitaciones', () => {
  test('invita a un nutricionista, la reenvía y la revoca', async ({ page }) => {
    const calls: string[] = [];
    let invitations: Record<string, unknown>[] = [];
    await mockApi(page, {
      session: 'ADMIN',
      routes: {
        '/admin/nutritionist-invitations?*': (route) => route.fulfill({ json: paged(invitations) }),
        '/admin/nutritionist-invitations': (route) => {
          const body = requestBody<Schemas['InviteNutritionistRequest']>(route);
          calls.push(`POST ${body.email}`);
          if (body.email === 'carlos.garcia@healthybites.com') {
            return route.fulfill(
              problem(409, 'email-taken', 'Ya existe una cuenta con ese correo'),
            );
          }
          const created = {
            id: 'inv1',
            ...body,
            status: 'PENDING',
            createdAt: '2026-11-12T10:00:00Z',
            expiresAt: '2026-11-19T10:00:00Z',
            acceptedAt: null,
          };
          invitations = [created];
          return route.fulfill({ json: created });
        },
        '/admin/nutritionist-invitations/inv1/resend': (route) => {
          calls.push('RESEND');
          return route.fulfill({ json: invitations[0] });
        },
        '/admin/nutritionist-invitations/inv1': (route) => {
          calls.push(`${route.request().method()} inv1`);
          invitations = [{ ...invitations[0], status: 'REVOKED' }];
          return route.fulfill({ status: 204 });
        },
      },
    });

    await page.goto('/admin/invitations');
    await expect(page.getByText('Aún no has invitado a nadie')).toBeVisible();
    await page.getByRole('button', { name: 'Invitar', exact: true }).click();

    const dialog = page.getByRole('dialog', { name: 'Invitar a un nutricionista' });
    await dialog.getByRole('button', { name: 'Enviar la invitación' }).click();
    await expect(dialog.getByText('Escribe su nombre')).toBeVisible();
    await expect(dialog.getByLabel('Nombre')).toBeFocused();

    await dialog.getByLabel('Nombre').fill('Elena');
    await dialog.getByLabel('Apellidos').fill('Gómez');
    await dialog.getByLabel('Correo electrónico').fill('elena@');
    await dialog.getByRole('button', { name: 'Enviar la invitación' }).click();
    await expect(dialog.getByText('Escribe un correo válido')).toBeVisible();

    await dialog.getByLabel('Correo electrónico').fill('carlos.garcia@healthybites.com');
    await dialog.getByRole('button', { name: 'Enviar la invitación' }).click();
    await expect(dialog.getByText('Ya existe una cuenta con ese correo')).toBeVisible();
    await expectNoA11yViolations(page);

    await dialog.getByLabel('Correo electrónico').fill('elena.gomez@correo.com');
    await dialog.getByRole('button', { name: 'Enviar la invitación' }).click();
    await expect(page.getByText('Caduca el 19 de noviembre de 2026')).toBeVisible();
    const row = page.getByRole('row').filter({ hasText: 'elena.gomez@correo.com' });
    await expect(row).toContainText('Pendiente');
    await expectNoA11yViolations(page);

    await page.getByRole('button', { name: 'Reenviar la invitación de Elena Gómez' }).click();
    await expect(page.getByText('Invitación reenviada')).toBeVisible();

    await page.getByRole('button', { name: 'Revocar la invitación de Elena Gómez' }).click();
    await page
      .getByRole('alertdialog', { name: 'Revocar la invitación' })
      .getByRole('button', { name: 'Revocar' })
      .click();
    await expect(page.getByText('Invitación revocada')).toBeVisible();
    await expect(row).toContainText('Revocada');
    await expect(page.getByRole('button', { name: /Revocar la invitación/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Reenviar la invitación/ })).toHaveCount(0);

    expect(calls).toEqual([
      'POST carlos.garcia@healthybites.com',
      'POST elena.gomez@correo.com',
      'RESEND',
      'DELETE inv1',
    ]);
  });
});

test.describe('administración: moderación', () => {
  test('oculta una publicación y descarta una denuncia ya cerrada', async ({ page }) => {
    const report = (id: string, overrides: Record<string, unknown> = {}) => ({
      id,
      targetType: 'POST',
      targetId: `t-${id}`,
      excerpt: 'Compra mis batidos milagro con descuento.',
      targetAuthor: { id: 'a1', name: 'Pedro Gómez' },
      reporter: { id: 'r1', name: 'María López' },
      reason: 'Publicidad',
      status: 'OPEN',
      targetHidden: false,
      createdAt: '2026-11-11T10:00:00Z',
      resolvedAt: null,
      ...overrides,
    });
    let open = [
      report('r1'),
      report('r2', {
        targetType: 'COMMENT',
        excerpt: 'Eres un pesado.',
        reason: 'Insultos',
        createdAt: '2026-11-11T12:00:00Z',
      }),
    ];
    const resolved = [
      report('r0', {
        status: 'RESOLVED',
        targetHidden: true,
        resolvedAt: '2026-11-05T09:00:00Z',
      }),
    ];
    const queries: Params[] = [];
    const bodies: string[] = [];
    await mockApi(page, {
      session: 'ADMIN',
      routes: {
        '/admin/moderation/reports?*': (route) => {
          const params = paramsOf(route);
          queries.push(params);
          return route.fulfill({ json: paged(params['status'] === 'OPEN' ? open : resolved) });
        },
        '/admin/moderation/reports/r1/resolve': (route) => {
          bodies.push(JSON.stringify(route.request().postDataJSON()));
          open = open.filter((r) => r.id !== 'r1');
          return route.fulfill({ json: { ...report('r1'), status: 'RESOLVED' } });
        },
        '/admin/moderation/reports/r2/resolve': (route) => {
          bodies.push(JSON.stringify(route.request().postDataJSON()));
          open = [];
          return route.fulfill(problem(409, 'report-closed', 'La denuncia ya está resuelta'));
        },
      },
    });

    await page.goto('/admin/moderation');
    const cards = page.getByRole('listitem').filter({ hasText: 'Denunciada el' });
    await expect(cards).toHaveCount(2);
    await expect(cards.first()).toContainText('Publicación');
    await expect(cards.first()).toContainText('De Pedro Gómez');
    await expect(cards.last()).toContainText('Comentario');
    expect(queries[0]).toEqual({ page: '0', size: '20', sort: 'createdAt,asc', status: 'OPEN' });
    await expectNoA11yViolations(page);

    await cards.first().getByRole('button', { name: 'Ocultar' }).click();
    const hide = page.getByRole('dialog', { name: 'Ocultar el contenido' });
    await expect(hide).toContainText('La publicación dejará de verse');
    await hide.getByRole('button', { name: 'Ocultar' }).click();
    await expect(hide.getByText('Escribe una nota breve')).toBeVisible();
    await hide.getByLabel('Nota para el registro').fill('Spam comercial');
    await expectNoA11yViolations(page);
    await hide.getByRole('button', { name: 'Ocultar' }).click();
    await expect(page.getByText('Contenido oculto', { exact: true })).toBeVisible();
    await expect(cards).toHaveCount(1);

    await cards.first().getByRole('button', { name: 'Descartar' }).click();
    const dismiss = page.getByRole('dialog', { name: 'Descartar la denuncia' });
    await dismiss.getByLabel('Nota para el registro').fill('Crítica, no insulto');
    await dismiss.getByRole('button', { name: 'Descartar' }).click();
    await expect(page.getByText('Ya estaba resuelta')).toBeVisible();
    await expect(page.getByText('No hay denuncias pendientes')).toBeVisible();

    await page.getByText('Resueltas', { exact: true }).click();
    await expect(page.getByText('Contenido ocultado el')).toBeVisible();
    expect(queries.at(-1)).toEqual({
      page: '0',
      size: '20',
      sort: 'createdAt,desc',
      status: 'RESOLVED',
    });
    expect(bodies).toEqual([
      '{"action":"HIDE","note":"Spam comercial"}',
      '{"action":"DISMISS","note":"Crítica, no insulto"}',
    ]);
  });
});

test.describe('administración: facturación', () => {
  test('resume los ingresos y lista suscripciones y pagos', async ({ page }) => {
    const subscriptionQueries: Params[] = [];
    let paymentRequests = 0;
    await mockApi(page, {
      session: 'ADMIN',
      routes: {
        '/admin/billing/summary': (route) =>
          route.fulfill({
            json: {
              activeByTier: { PREMIUM: 8, VIP: 4 },
              monthlyRecurringRevenue: [{ amount: '87.88', currency: 'USD' }],
              revenueLast30Days: [{ amount: '95.87', currency: 'USD' }],
              paymentsLast30Days: 13,
            },
          }),
        '/admin/subscriptions?*': (route) => {
          subscriptionQueries.push(paramsOf(route));
          return route.fulfill({
            json: paged([
              {
                id: 's1',
                userId: 'u1',
                customer: { id: 'u1', name: 'María López', email: 'maria@correo.com' },
                tier: 'PREMIUM',
                status: 'ACTIVE',
                currentPeriodStart: '2026-11-01T10:00:00Z',
                currentPeriodEnd: '2026-12-01T10:00:00Z',
                canceledAt: null,
                createdAt: '2026-11-01T10:00:00Z',
              },
              {
                id: 's2',
                userId: 'u2',
                customer: null,
                tier: 'VIP',
                status: 'PENDING_PAYMENT',
                currentPeriodStart: null,
                currentPeriodEnd: null,
                canceledAt: null,
                createdAt: '2026-11-11T10:00:00Z',
              },
            ]),
          });
        },
        '/admin/payments?*': (route) => {
          paymentRequests += 1;
          return route.fulfill({
            json: paged([
              {
                id: 'p1',
                userId: 'u1',
                customer: { id: 'u1', name: 'María López', email: 'maria@correo.com' },
                subscriptionId: 's1',
                providerOrderId: 'ORDER-5O190127TN364715T',
                amount: { amount: '5.99', currency: 'USD' },
                status: 'CAPTURED',
                createdAt: '2026-11-01T10:00:00Z',
                capturedAt: '2026-11-01T10:01:00Z',
              },
            ]),
          });
        },
      },
    });

    await page.goto('/admin/billing');
    const summary = page.getByRole('region', { name: 'Resumen' });
    await expect(summary).toContainText('Suscripciones vigentes12');
    await expect(summary).toContainText('Premium: 8 · VIP: 4');
    await expect(summary).toContainText('87,88 US$');
    await expect(summary).toContainText('95,87 US$');
    await expect(summary).toContainText('Pagos (30 días)13');

    const rows = page.getByRole('row').filter({ hasText: /López|eliminada/ });
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toContainText('Activa');
    await expect(rows.last()).toContainText('Cuenta eliminada');
    await expect(rows.last()).toContainText('Sin pagar');
    expect(paymentRequests).toBe(0);
    expect(subscriptionQueries).toHaveLength(1);
    await expectNoA11yViolations(page);

    await choose(page, 'Nivel', 'VIP');
    await expect.poll(() => subscriptionQueries.at(-1)?.['tier']).toBe('VIP');

    await page.getByRole('tab', { name: 'Pagos' }).click();
    const payment = page.getByRole('row').filter({ hasText: 'ORDER-5O190127TN364715T' });
    await expect(payment).toContainText('5,99 US$');
    await expect(payment).toContainText('Pagado');
    expect(paymentRequests).toBe(1);
    await expectNoA11yViolations(page);
  });
});
