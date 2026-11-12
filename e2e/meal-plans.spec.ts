import { expect, test } from './support/test';
import { expectNoA11yViolations } from './support/a11y';
import { mockApi, problem } from './support/api';

const AUTHOR = { id: 'n1', name: 'Carlos García' };

function summary(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    title: `Plan ${id}`,
    description: 'Un plan equilibrado para empezar.',
    goal: 'WEIGHT_LOSS',
    durationDays: 2,
    requiredTier: 'BASIC',
    locked: false,
    averageDailyCalories: 1800,
    status: 'PUBLISHED',
    author: AUTHOR,
    publishedAt: '2026-11-01T10:00:00Z',
    ...overrides,
  };
}

function page<T>(content: T[]) {
  return { content, page: { size: 12, number: 0, totalElements: content.length, totalPages: 1 } };
}

const MEALS = [
  {
    id: 'm1',
    dayNumber: 1,
    position: 1,
    category: 'BREAKFAST',
    name: 'Avena con fruta',
    calories: 400,
    description: null,
  },
  {
    id: 'm2',
    dayNumber: 1,
    position: 2,
    category: 'LUNCH',
    name: 'Ensalada de quinoa',
    calories: 650,
    description: 'Con garbanzos',
  },
];

test.describe('planes del cliente', () => {
  test('ve los planes que sigue, el catálogo y filtra por objetivo', async ({ page: browser }) => {
    const goals: (string | null)[] = [];
    await mockApi(browser, {
      session: 'CLIENT',
      routes: {
        '/me/meal-plan-enrollments': (route) =>
          route.fulfill({
            json: [
              {
                id: 'e1',
                plan: summary('seguido'),
                source: 'REWARD',
                enrolledAt: '2026-11-02T10:00:00Z',
              },
            ],
          }),
        '/meal-plans?*': (route) => {
          const goal = new URL(route.request().url()).searchParams.get('goal');
          goals.push(goal);
          return route.fulfill({
            json: page(
              goal === 'MUSCLE_GAIN'
                ? [summary('fuerza', { goal: 'MUSCLE_GAIN' })]
                : [
                    summary('ligero'),
                    summary('premium', { requiredTier: 'PREMIUM', locked: true }),
                  ],
            ),
          });
        },
      },
    });

    await browser.goto('/client/meal-plans');
    const following = browser.getByRole('region', { name: 'Los planes que sigues' });
    await expect(following.getByText('Plan seguido')).toBeVisible();
    await expect(following.getByText('Premio')).toBeVisible();
    await expect(browser.getByRole('link', { name: /Plan premium/ })).toContainText('Bloqueado');
    await expectNoA11yViolations(browser);

    await browser.getByText('Ganar músculo', { exact: true }).click();
    await expect(browser.getByText('Plan fuerza')).toBeVisible();
    expect(goals).toEqual([null, 'MUSCLE_GAIN']);
  });

  test('abre un plan con sus comidas por día y lo sigue', async ({ page: browser }) => {
    let enrolled: unknown;
    let following = false;
    await mockApi(browser, {
      session: 'CLIENT',
      routes: {
        '/meal-plans/p1': (route) =>
          route.fulfill({ json: { plan: summary('p1'), status: 'PUBLISHED', meals: MEALS } }),
        '/me/meal-plan-enrollments': (route) => {
          if (route.request().method() === 'POST') {
            enrolled = route.request().postDataJSON();
            following = true;
            return route.fulfill({ status: 201, json: {} });
          }
          return route.fulfill({
            json: following
              ? [
                  {
                    id: 'e1',
                    plan: summary('p1'),
                    source: 'SELF',
                    enrolledAt: '2026-11-12T10:00:00Z',
                  },
                ]
              : [],
          });
        },
      },
    });

    await browser.goto('/client/meal-plans/p1');
    await expect(browser.getByRole('heading', { level: 1, name: 'Plan p1' })).toBeVisible();
    const dayOne = browser.getByRole('region', { name: 'Día 1' });
    await expect(dayOne.getByRole('listitem')).toHaveCount(2);
    await expect(dayOne).toContainText('1.050 kcal');
    await expect(browser.getByRole('region', { name: 'Día 2' })).toContainText('Día libre');
    await expectNoA11yViolations(browser);

    await browser.getByRole('button', { name: 'Seguir este plan' }).click();

    await expect(browser.getByText('Sigues este plan', { exact: true })).toBeVisible();
    expect(enrolled).toEqual({ mealPlanId: 'p1' });
  });

  test('un plan de pago bloqueado explica cómo conseguirlo', async ({ page: browser }) => {
    await mockApi(browser, {
      session: 'CLIENT',
      routes: {
        '/meal-plans/vip': (route) =>
          route.fulfill(
            problem(403, 'subscription-required', 'Necesitas VIP', { requiredTier: 'VIP' }),
          ),
        '/me/meal-plan-enrollments': (route) => route.fulfill({ json: [] }),
      },
    });

    await browser.goto('/client/meal-plans/vip');

    await expect(
      browser.getByRole('heading', { level: 1, name: 'Este plan es VIP' }),
    ).toBeVisible();
    await expect(
      browser.getByRole('link', { name: 'Ver los planes de suscripción' }),
    ).toHaveAttribute('href', '/client/subscription');
  });
});

test.describe('planes del nutricionista', () => {
  test('crea un plan, le añade una comida y lo publica', async ({ page: browser }) => {
    const plan = summary('nuevo', {
      title: 'Semana ligera',
      status: 'DRAFT',
      durationDays: 3,
      publishedAt: null,
    });
    const meals: Record<string, unknown>[] = [];
    let created: unknown;
    let addedMeal: unknown;
    let status = 'DRAFT';
    const detail = () => ({ plan: { ...plan, status }, status, meals });
    await mockApi(browser, {
      session: 'NUTRITIONIST',
      routes: {
        '/nutritionist/meal-plans': (route) => {
          created = route.request().postDataJSON();
          return route.fulfill({ status: 201, json: detail() });
        },
        '/nutritionist/meal-plans/nuevo': (route) => route.fulfill({ json: detail() }),
        '/nutritionist/meal-plans/nuevo/meals': (route) => {
          addedMeal = route.request().postDataJSON();
          const meal = { id: `m${meals.length + 1}`, ...(addedMeal as object) };
          meals.push(meal);
          return route.fulfill({ status: 201, json: meal });
        },
        '/nutritionist/meal-plans/nuevo/publish': (route) => {
          status = 'PUBLISHED';
          return route.fulfill({ json: detail() });
        },
      },
    });

    await browser.goto('/nutritionist/meal-plans/new');
    await browser.getByRole('button', { name: 'Crear y añadir comidas' }).click();
    await expect(browser.getByText('Ponle un título')).toBeVisible();
    await expect(browser.getByText('Elige el objetivo')).toBeVisible();

    await browser.getByLabel('Título').fill('Semana ligera');
    await browser.getByLabel('Descripción').fill('Tres días para empezar a comer mejor.');
    await browser.getByRole('combobox', { name: 'Objetivo' }).click();
    await browser.getByRole('option', { name: 'Perder peso' }).click();
    await browser.getByLabel('Duración').fill('3');
    await browser.getByRole('button', { name: 'Crear y añadir comidas' }).click();

    await expect(browser).toHaveURL(/\/nutritionist\/meal-plans\/nuevo$/);
    expect(created).toEqual({
      title: 'Semana ligera',
      description: 'Tres días para empezar a comer mejor.',
      goal: 'WEIGHT_LOSS',
      requiredTier: 'BASIC',
      durationDays: 3,
    });
    await expect(browser.getByRole('heading', { level: 1, name: 'Semana ligera' })).toBeVisible();
    await expectNoA11yViolations(browser);

    await browser.getByRole('button', { name: 'Añadir comida al día 2' }).click();
    const dialog = browser.getByRole('dialog', { name: 'Nueva comida' });
    await dialog.getByRole('combobox', { name: 'Momento del día' }).click();
    await browser.getByRole('option', { name: 'Cena' }).click();
    await dialog.getByLabel('Plato').fill('Crema de calabaza');
    await dialog.getByLabel('Calorías').fill('450');
    await expect(browser.getByRole('listbox')).toBeHidden();
    await expectNoA11yViolations(browser);
    await dialog.getByRole('button', { name: 'Añadir' }).click();

    await expect(browser.getByRole('region', { name: /Día 2/ })).toContainText('Crema de calabaza');
    expect(addedMeal).toEqual({
      dayNumber: 2,
      position: 1,
      category: 'DINNER',
      name: 'Crema de calabaza',
      calories: 450,
      description: null,
    });

    await browser.getByRole('button', { name: 'Publicar' }).click();
    await expect(
      browser.getByText('Publicado: está en el catálogo para los clientes.'),
    ).toBeVisible();
  });

  test('borra un borrador tras confirmarlo', async ({ page: browser }) => {
    let deleted = false;
    await mockApi(browser, {
      session: 'NUTRITIONIST',
      routes: {
        '/nutritionist/meal-plans/borrador': (route) => {
          if (route.request().method() === 'DELETE') {
            deleted = true;
            return route.fulfill({ status: 204 });
          }
          return route.fulfill({
            json: { plan: summary('borrador', { status: 'DRAFT' }), status: 'DRAFT', meals: [] },
          });
        },
        '/nutritionist/meal-plans?*': (route) => route.fulfill({ json: page([]) }),
      },
    });

    await browser.goto('/nutritionist/meal-plans/borrador');
    await browser.getByRole('button', { name: 'Eliminar' }).click();
    await browser
      .getByRole('alertdialog', { name: 'Eliminar el borrador' })
      .getByRole('button', { name: 'Eliminar' })
      .click();

    await expect(browser).toHaveURL(/\/nutritionist\/meal-plans$/);
    await expect(browser.getByText('Aún no has creado ningún plan')).toBeVisible();
    expect(deleted).toBe(true);
  });
});
