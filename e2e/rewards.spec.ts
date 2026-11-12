import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';
import { mockApi } from './support/api';

function reward(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    title: `Recompensa ${id}`,
    description: 'Registra tus hábitos cada día.',
    requiredStreakDays: 7,
    active: true,
    target: { id: `plan-${id}`, title: `Plan ${id}`, type: 'MEAL_PLAN' },
    streak: null,
    ...overrides,
  };
}

const IN_PROGRESS = reward('constancia', {
  streak: {
    id: 's1',
    currentDays: 3,
    completed: false,
    completedAt: null,
    lastCountedOn: '2026-11-11',
  },
});
const COMPLETED = reward('veterana', {
  requiredStreakDays: 14,
  streak: {
    id: 's2',
    currentDays: 14,
    completed: true,
    completedAt: '2026-10-30T10:00:00Z',
    lastCountedOn: '2026-10-30',
  },
});

test.describe('recompensas del cliente', () => {
  test('ve sus rachas, empieza una nueva y abandona otra', async ({ page }) => {
    const calls: string[] = [];
    let catalog = [IN_PROGRESS, reward('nueva')];
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/rewards': (route) => route.fulfill({ json: catalog }),
        '/me/streaks': (route) => {
          if (route.request().method() === 'POST') {
            calls.push(`POST ${JSON.stringify(route.request().postDataJSON())}`);
            catalog = [
              IN_PROGRESS,
              {
                ...reward('nueva'),
                streak: {
                  id: 's3',
                  currentDays: 0,
                  completed: false,
                  completedAt: null,
                  lastCountedOn: null,
                },
              },
            ];
            return route.fulfill({ status: 201, json: catalog[1] });
          }
          return route.fulfill({ json: [IN_PROGRESS, COMPLETED] });
        },
        '/me/streaks/s1': (route) => {
          calls.push('DELETE s1');
          return route.fulfill({ status: 204 });
        },
      },
    });

    await page.goto('/client/rewards');
    const mine = page.getByRole('region', { name: 'Tus rachas' });
    await expect(mine).toContainText('3de 7 días');
    await expect(mine.getByRole('progressbar').first()).toHaveAttribute('aria-valuenow', '43');
    await expect(mine.getByRole('link', { name: 'Ver mi premio' })).toHaveAttribute(
      'href',
      '/client/meal-plans/plan-veterana',
    );
    await expectNoA11yViolations(page);

    await page.getByRole('button', { name: 'Empezar la racha' }).click();
    await expect(page.getByText('Racha empezada')).toBeVisible();

    await mine.getByRole('button', { name: 'Abandonar la racha' }).first().click();
    await page
      .getByRole('alertdialog', { name: 'Abandonar la racha' })
      .getByRole('button', { name: 'Abandonar' })
      .click();
    await expect(page.getByText('Racha abandonada')).toBeVisible();

    expect(calls).toEqual(['POST {"rewardId":"nueva"}', 'DELETE s1']);
  });
});

test.describe('recompensas del nutricionista', () => {
  test('crea una recompensa con uno de sus planes publicados como premio', async ({ page }) => {
    let created: unknown;
    const page0 = <T>(content: T[]) => ({
      content,
      page: { size: 100, number: 0, totalElements: content.length, totalPages: 1 },
    });
    await mockApi(page, {
      session: 'NUTRITIONIST',
      routes: {
        '/nutritionist/rewards': (route) => {
          if (route.request().method() === 'POST') {
            created = route.request().postDataJSON();
            return route.fulfill({ status: 201, json: reward('creada') });
          }
          return route.fulfill({ json: [] });
        },
        '/nutritionist/content-items?*': (route) => route.fulfill({ json: page0([]) }),
        '/nutritionist/meal-plans?*': (route) =>
          route.fulfill({
            json: page0([
              { id: 'p-pub', title: 'Semana ligera', status: 'PUBLISHED' },
              { id: 'p-draft', title: 'Borrador secreto', status: 'DRAFT' },
            ]),
          }),
      },
    });

    await page.goto('/nutritionist/rewards');
    await expect(page.getByText('Aún no has creado recompensas')).toBeVisible();
    await page.getByRole('button', { name: 'Nueva recompensa' }).click();

    const dialog = page.getByRole('dialog', { name: 'Nueva recompensa' });
    await dialog.getByLabel('Nombre').fill('Una semana constante');
    await dialog.getByLabel('Descripción').fill('Siete días seguidos registrando hábitos.');
    await dialog.getByText('Un plan', { exact: true }).click();
    await dialog.getByRole('combobox', { name: 'Plan alimenticio' }).click();
    await expect(page.getByRole('option')).toHaveText(['Semana ligera']);
    await page.getByRole('option', { name: 'Semana ligera' }).click();
    await expect(page.getByRole('listbox')).toBeHidden();
    await expectNoA11yViolations(page);
    await dialog.getByRole('button', { name: 'Crear la recompensa' }).click();

    await expect(page.getByText('Recompensa guardada')).toBeVisible();
    expect(created).toEqual({
      title: 'Una semana constante',
      description: 'Siete días seguidos registrando hábitos.',
      requiredStreakDays: 7,
      contentItemId: null,
      mealPlanId: 'p-pub',
    });
  });
});
