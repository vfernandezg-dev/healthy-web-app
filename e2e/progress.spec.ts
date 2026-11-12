import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';
import type { components } from '../src/app/core/api/schema';
import { mockApi, problem } from './support/api';

const GOAL: components['schemas']['GoalResponse'] = {
  id: 'g1',
  title: 'Llegar a 70 kg',
  description: null,
  targetWeightKg: 70,
  status: 'ACTIVE',
  startedOn: '2026-10-01',
  createdAt: '2026-10-01T10:00:00Z',
  completedAt: null,
};
const ENTRIES = [
  { id: 'w1', measuredOn: '2026-10-01', weightKg: 80, notes: null },
  { id: 'w2', measuredOn: '2026-10-15', weightKg: 78.2, notes: 'Después de vacaciones' },
  { id: 'w3', measuredOn: '2026-11-01', weightKg: 77.4, notes: null },
];
const RECOMMENDATION = {
  heightCm: 172,
  healthyMinKg: 54.7,
  healthyMaxKg: 73.7,
  targetWeightKg: 70,
  targetBmi: 23.7,
  targetInHealthyRange: true,
  currentWeightKg: 77.4,
  currentBmi: 26.2,
  weeklyChangeKg: 0.5,
  estimatedWeeks: 15,
  message: 'Tu objetivo está dentro del rango saludable para tu altura.',
};

test.describe('progreso', () => {
  test('sin meta activa, crea una', async ({ page }) => {
    let created: unknown;
    let goals: unknown[] = [];
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/me/goals': (route) => {
          if (route.request().method() === 'POST') {
            created = route.request().postDataJSON();
            goals = [GOAL];
            return route.fulfill({ status: 201, json: GOAL });
          }
          return route.fulfill({ json: goals });
        },
        '/me/goals/g1/weight-entries': (route) => route.fulfill({ json: [] }),
        '/me/goals/g1/recommendation': (route) => route.fulfill({ json: RECOMMENDATION }),
      },
    });

    await page.goto('/client/progress');
    await expect(page.getByText('Aún no tienes una meta activa')).toBeVisible();
    await expectNoA11yViolations(page);

    await page.getByRole('button', { name: 'Crear una meta' }).click();
    const dialog = page.getByRole('dialog', { name: 'Nueva meta' });
    await dialog.getByLabel('Nombre de la meta').fill('Llegar a 70 kg');
    await dialog.getByLabel('Peso objetivo').fill('70');
    await expectNoA11yViolations(page);
    await dialog.getByRole('button', { name: 'Crear la meta' }).click();

    await expect(page.getByRole('heading', { level: 2, name: 'Llegar a 70 kg' })).toBeVisible();
    await expect(page.getByText('Añade tu primer pesaje')).toBeVisible();
    expect(created).toEqual({ title: 'Llegar a 70 kg', targetWeightKg: 70, description: null });
  });

  test('con meta activa, muestra cómo va, el gráfico y la recomendación', async ({ page }) => {
    const entries = [...ENTRIES];
    let added: unknown;
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/me/goals': (route) => route.fulfill({ json: [GOAL] }),
        '/me/goals/g1/weight-entries': (route) => {
          if (route.request().method() === 'POST') {
            added = route.request().postDataJSON();
            entries.push({ id: 'w4', measuredOn: '2026-11-10', weightKg: 76.8, notes: null });
            return route.fulfill({ status: 201, json: entries.at(-1) });
          }
          return route.fulfill({ json: entries });
        },
        '/me/goals/g1/recommendation': (route) => route.fulfill({ json: RECOMMENDATION }),
      },
    });

    await page.goto('/client/progress');
    const summary = page.getByRole('region', { name: 'Llegar a 70 kg' });
    await expect(summary).toContainText('77,4 kg');
    await expect(summary).toContainText('Te quedan por bajar');
    await expect(summary).toContainText('7,4 kg');
    await expect(summary).toContainText('Avance desde tu primer pesaje: 26 %');
    await expect(page.getByText('54,7 y 73,7 kg')).toBeVisible();

    // El gráfico se carga al llegar a su sección (@defer on viewport).
    await page
      .getByRole('region', { name: 'Evolución del peso' })
      .evaluate((section) => section.scrollIntoView({ block: 'center' }));
    const chart = page.getByRole('img', {
      name: /Evolución del peso: 3 pesajes, de 80 kg a 77,4 kg/,
    });
    await expect(chart.locator('svg').first()).toBeVisible();
    await expectNoA11yViolations(page);

    await page.getByLabel('Día', { exact: true }).fill('2026-11-10');
    await page.getByLabel('Peso', { exact: true }).fill('76,8');
    await page.getByRole('button', { name: 'Añadir' }).click();

    await expect(page.getByText('Pesaje añadido')).toBeVisible();
    expect(added).toEqual({ measuredOn: '2026-11-10', weightKg: 76.8, notes: null });
    await expect(page.getByRole('img', { name: /4 pesajes/ })).toBeVisible();
  });

  test('un pesaje repetido se marca en la fecha', async ({ page }) => {
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/me/goals': (route) => route.fulfill({ json: [GOAL] }),
        '/me/goals/g1/weight-entries': (route) =>
          route.request().method() === 'POST'
            ? route.fulfill(
                problem(409, 'weight-entry-exists', 'Ya hay un pesaje ese día: edítalo'),
              )
            : route.fulfill({ json: ENTRIES }),
        '/me/goals/g1/recommendation': (route) => route.fulfill({ json: RECOMMENDATION }),
      },
    });

    await page.goto('/client/progress');
    await page.getByLabel('Día', { exact: true }).fill('2026-11-01');
    await page.getByLabel('Peso', { exact: true }).fill('77');
    await page.getByRole('button', { name: 'Añadir' }).click();

    await expect(page.locator('#entry-date-error')).toHaveText('Ya hay un pesaje ese día: edítalo');
  });

  test('sin altura en el perfil, explica por qué no hay recomendación', async ({ page }) => {
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/me/goals': (route) => route.fulfill({ json: [GOAL] }),
        '/me/goals/g1/weight-entries': (route) => route.fulfill({ json: [] }),
        '/me/goals/g1/recommendation': (route) =>
          route.fulfill(
            problem(
              409,
              'profile-incomplete',
              'Añade tu altura en el perfil para calcular la recomendación',
            ),
          ),
      },
    });

    await page.goto('/client/progress');
    await expect(page.getByText('Añade tu altura en el perfil')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Completar mi perfil' })).toHaveAttribute(
      'href',
      '/client/profile',
    );
  });

  test('dar la meta por cumplida la pasa a las anteriores', async ({ page }) => {
    let goals = [GOAL];
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/me/goals': (route) => route.fulfill({ json: goals }),
        '/me/goals/g1/weight-entries': (route) => route.fulfill({ json: ENTRIES }),
        '/me/goals/g1/recommendation': (route) => route.fulfill({ json: RECOMMENDATION }),
        '/me/goals/g1/complete': (route) => {
          goals = [{ ...GOAL, status: 'COMPLETED', completedAt: '2026-11-12T10:00:00Z' }];
          return route.fulfill({ json: goals[0] });
        },
      },
    });

    await page.goto('/client/progress');
    await page.getByRole('button', { name: 'Dar por cumplida' }).click();
    await page
      .getByRole('alertdialog', { name: 'Dar la meta por cumplida' })
      .getByRole('button', { name: 'Dar por cumplida' })
      .click();

    await expect(page.getByText('Aún no tienes una meta activa')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Metas anteriores' })).toContainText('Cumplida');
  });
});
