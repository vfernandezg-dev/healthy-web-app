import { expect, test } from './support/test';
import { expectNoA11yViolations } from './support/a11y';
import { mockApi } from './support/api';

/** Hoy en la zona de las pruebas (playwright.config: America/Lima), como YYYY-MM-DD. */
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());

/** Primera página de un listado de la API, con `totalElements` elementos en total. */
function paged<T>(content: T[], size: number, totalElements = content.length) {
  return {
    content,
    page: { size, number: 0, totalElements, totalPages: Math.ceil(totalElements / size) },
  };
}

/** Parámetros de la petición, para comprobar qué pidió la página. */
function paramsOf(url: string): Record<string, string> {
  return Object.fromEntries(new URL(url).searchParams);
}

test.describe('inicio del cliente', () => {
  test('resume su meta, los hábitos de hoy, su plan y sus rachas', async ({ page }) => {
    let habitsQuery: Record<string, string> = {};
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/me/goals': (route) =>
          route.fulfill({
            json: [
              {
                id: 'g0',
                title: 'Meta antigua',
                status: 'COMPLETED',
                targetWeightKg: 70,
                startedOn: '2026-01-01',
              },
              {
                id: 'g1',
                title: 'Bajar a 65 kg',
                status: 'ACTIVE',
                targetWeightKg: 65,
                startedOn: '2026-10-01',
              },
            ],
          }),
        '/me/goals/g1/weight-entries': (route) =>
          route.fulfill({
            json: [
              { id: 'w1', measuredOn: '2026-10-01', weightKg: 70 },
              { id: 'w2', measuredOn: '2026-11-10', weightKg: 67.5 },
            ],
          }),
        '/me/habit-logs?*': (route) => {
          habitsQuery = Object.fromEntries(new URL(route.request().url()).searchParams);
          return route.fulfill({
            json: [
              {
                id: 'h1',
                loggedOn: TODAY,
                hydration: 8,
                nutrition: 7,
                exercise: 6,
                sleep: 9,
                average: 7.5,
              },
            ],
          });
        },
        '/me/streaks': (route) =>
          route.fulfill({
            json: [
              {
                id: 'r1',
                title: 'Una semana constante',
                description: '',
                requiredStreakDays: 7,
                active: true,
                target: { id: 'p1', title: 'Semana ligera', type: 'MEAL_PLAN' },
                streak: {
                  id: 's1',
                  currentDays: 3,
                  completed: false,
                  completedAt: null,
                  lastCountedOn: TODAY,
                },
              },
              {
                id: 'r2',
                title: 'Ya conseguida',
                description: '',
                requiredStreakDays: 3,
                active: true,
                target: { id: 'c1', title: 'Guía', type: 'CONTENT' },
                streak: {
                  id: 's2',
                  currentDays: 3,
                  completed: true,
                  completedAt: '2026-11-01T10:00:00Z',
                  lastCountedOn: '2026-11-01',
                },
              },
            ],
          }),
        '/me/subscription': (route) =>
          route.fulfill({
            json: {
              tier: 'PREMIUM',
              status: 'ACTIVE',
              renews: true,
              currentPeriodEnd: '2026-12-01T15:00:00Z',
              subscriptionId: 'sub1',
            },
          }),
      },
    });

    await page.goto('/client');
    await expect(page.getByRole('heading', { level: 1, name: 'Hola, María' })).toBeVisible();

    const goal = page.getByRole('region', { name: 'Tu meta' });
    await expect(goal).toContainText('Bajar a 65 kg');
    await expect(goal).toContainText('67,5 kg ahora · objetivo 65 kg');
    await expect(goal.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    await expect(goal).toContainText('Te faltan 2,5 kg');

    const today = page.getByRole('region', { name: 'Hábitos de hoy' });
    await expect(today).toContainText('7,5/10');
    await expect(today).toContainText('Sueño9/10');
    expect(habitsQuery).toEqual({ from: TODAY, to: TODAY });

    const plan = page.getByRole('region', { name: 'Tu plan' });
    await expect(plan).toContainText('Premium');
    await expect(plan).toContainText('Se renueva el 1 de diciembre de 2026');

    const streaks = page.getByRole('region', { name: 'Rachas en curso' });
    await expect(streaks.getByRole('listitem')).toHaveCount(1);
    await expect(streaks).toContainText('3 de 7 días · premio: Semana ligera');
    await expect(
      page.getByRole('region', { name: 'Accesos directos' }).getByRole('link', { name: /Hábitos/ }),
    ).toHaveAttribute('href', '/client/habits');
    await expectNoA11yViolations(page);
  });

  test('sin datos, invita a empezar', async ({ page }) => {
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/me/goals': (route) => route.fulfill({ json: [] }),
        '/me/habit-logs?*': (route) => route.fulfill({ json: [] }),
        '/me/streaks': (route) => route.fulfill({ json: [] }),
        '/me/subscription': (route) =>
          route.fulfill({
            json: {
              tier: 'BASIC',
              status: null,
              renews: false,
              currentPeriodEnd: null,
              subscriptionId: null,
            },
          }),
      },
    });

    await page.goto('/client');
    await expect(page.getByRole('link', { name: 'Crear una meta' })).toHaveAttribute(
      'href',
      '/client/progress',
    );
    await expect(page.getByRole('link', { name: 'Registrar hoy' })).toHaveAttribute(
      'href',
      '/client/habits',
    );
    await expect(page.getByRole('link', { name: 'Ver los planes' })).toHaveAttribute(
      'href',
      '/client/subscription',
    );
    await expect(page.getByText('No tienes rachas en curso')).toBeVisible();
    await expectNoA11yViolations(page);
  });
});

test.describe('inicio del nutricionista', () => {
  test('cuenta con los resúmenes y pide solo los clientes recientes y los borradores', async ({
    page,
  }) => {
    const client = (id: string, firstName: string, since: string) => ({
      id,
      firstName,
      lastName: 'Ruiz',
      email: `${id}@correo.com`,
      heightCm: 170,
      weightKg: 65,
      plans: ['Semana ligera'],
      since,
    });
    const queries: Record<string, Record<string, string>> = {};
    await mockApi(page, {
      session: 'NUTRITIONIST',
      routes: {
        '/nutritionist/clients?*': (route) => {
          queries['clients'] = paramsOf(route.request().url());
          // La API los manda de más reciente a más antiguo.
          return route.fulfill({
            json: paged(
              [
                client('b', 'Bea', '2026-11-01T10:00:00Z'),
                client('c', 'Carla', '2026-10-01T10:00:00Z'),
                client('a', 'Ana', '2026-09-01T10:00:00Z'),
              ],
              4,
              7,
            ),
          });
        },
        '/nutritionist/rewards?*': (route) => {
          queries['rewards'] = paramsOf(route.request().url());
          return route.fulfill({ json: paged([{ id: 'r1', active: true }], 1, 3) });
        },
        '/nutritionist/meal-plans/summary': (route) =>
          route.fulfill({ json: { draft: 1, published: 2, archived: 0 } }),
        '/nutritionist/content-items/summary': (route) =>
          route.fulfill({ json: { draft: 1, published: 1, archived: 1 } }),
        '/nutritionist/meal-plans?*': (route) => {
          queries['plans'] = paramsOf(route.request().url());
          return route.fulfill({
            json: paged([{ id: 'p3', title: 'Plan sin terminar', status: 'DRAFT' }], 5),
          });
        },
        '/nutritionist/content-items?*': (route) => {
          queries['content'] = paramsOf(route.request().url());
          return route.fulfill({
            json: paged([{ id: 'c2', title: 'Artículo a medias', status: 'DRAFT' }], 5),
          });
        },
      },
    });

    await page.goto('/nutritionist');
    await expect(page.getByRole('heading', { level: 1, name: 'Hola, Carlos' })).toBeVisible();
    const stats = page.getByRole('region', { name: 'Cifras' });
    await expect(stats).toContainText('Clientes7');
    await expect(stats).toContainText('Planes publicados21 sin publicar');
    await expect(stats).toContainText('Contenidos publicados12 sin publicar');
    await expect(stats).toContainText('Recompensas activas3');

    const recent = page.getByRole('region', { name: 'Clientes recientes' }).getByRole('listitem');
    await expect(recent).toHaveCount(3);
    await expect(recent.first()).toContainText('Bea Ruiz');

    const drafts = page.getByRole('region', { name: 'Borradores por publicar' });
    await expect(drafts.getByRole('link')).toHaveCount(2);
    await expect(drafts.getByRole('link', { name: /Plan sin terminar/ })).toHaveAttribute(
      'href',
      '/nutritionist/meal-plans/p3',
    );
    await expect(drafts.getByRole('link', { name: /Artículo a medias/ })).toHaveAttribute(
      'href',
      '/nutritionist/content/c2',
    );
    await expectNoA11yViolations(page);

    expect(queries).toEqual({
      clients: { size: '4' },
      rewards: { active: 'true', size: '1' },
      plans: { status: 'DRAFT', size: '5', sort: 'updatedAt,desc' },
      content: { status: 'DRAFT', size: '5', sort: 'updatedAt,desc' },
    });
  });

  test('sin borradores ni clientes, lo dice', async ({ page }) => {
    const empty = { draft: 0, published: 3, archived: 0 };
    await mockApi(page, {
      session: 'NUTRITIONIST',
      routes: {
        '/nutritionist/clients?*': (route) => route.fulfill({ json: paged([], 4) }),
        '/nutritionist/rewards?*': (route) => route.fulfill({ json: paged([], 1) }),
        '/nutritionist/meal-plans/summary': (route) => route.fulfill({ json: empty }),
        '/nutritionist/content-items/summary': (route) => route.fulfill({ json: empty }),
        '/nutritionist/meal-plans?*': (route) => route.fulfill({ json: paged([], 5) }),
        '/nutritionist/content-items?*': (route) => route.fulfill({ json: paged([], 5) }),
      },
    });

    await page.goto('/nutritionist');
    const stats = page.getByRole('region', { name: 'Cifras' });
    await expect(stats).toContainText('Clientes0');
    await expect(stats).toContainText('Planes publicados3Todo publicado');
    await expect(page.getByText('Aún no tienes clientes.')).toBeVisible();
    await expect(page.getByText('No tienes borradores: todo está publicado.')).toBeVisible();
  });
});

test.describe('resumen de administración', () => {
  test('muestra cuentas, ingresos, denuncias pendientes y cuentas por rol', async ({ page }) => {
    await mockApi(page, {
      session: 'ADMIN',
      routes: {
        '/admin/users/summary': (route) =>
          route.fulfill({
            json: {
              total: 120,
              active: 115,
              deactivated: 5,
              newLast30Days: 18,
              byRole: { CLIENT: 96, NUTRITIONIST: 22, ADMIN: 2 },
            },
          }),
        '/admin/billing/summary': (route) =>
          route.fulfill({
            json: {
              activeByTier: { PREMIUM: 30, VIP: 10 },
              monthlyRecurringRevenue: [{ amount: '279.60', currency: 'USD' }],
              revenueLast30Days: [{ amount: '300.00', currency: 'USD' }],
              paymentsLast30Days: 42,
            },
          }),
        '/admin/moderation/reports?*': (route) =>
          route.fulfill({
            json: {
              content: [
                {
                  id: 'r1',
                  targetType: 'POST',
                  targetId: 't1',
                  excerpt: 'Compra mis batidos milagro.',
                  reason: 'Publicidad',
                  status: 'OPEN',
                  targetHidden: false,
                  createdAt: '2026-11-11T10:00:00Z',
                },
              ],
              page: { size: 20, number: 0, totalElements: 4, totalPages: 1 },
            },
          }),
      },
    });

    await page.goto('/admin');
    const kpis = page.getByRole('region', { name: 'Cifras' });
    await expect(kpis).toContainText('Cuentas120115 activas · 5 desactivadas');
    await expect(kpis).toContainText('Altas (30 días)18');
    await expect(kpis).toContainText('Suscripciones vigentes40Premium: 30 · VIP: 10');
    await expect(kpis).toContainText('279,60 US$');

    const moderation = page.getByRole('region', { name: 'Moderación' });
    await expect(moderation).toContainText('4 denuncias pendientes');
    await expect(moderation).toContainText('Publicación · Publicidad');
    await expect(moderation.getByRole('link', { name: 'Revisar las denuncias' })).toHaveAttribute(
      'href',
      '/admin/moderation',
    );

    const roles = page.getByRole('region', { name: 'Cuentas por rol' });
    await expect(roles).toContainText('Clientes96 (80 %)');
    await expect(roles).toContainText('Nutricionistas22 (18 %)');
    await expectNoA11yViolations(page);
  });
});
