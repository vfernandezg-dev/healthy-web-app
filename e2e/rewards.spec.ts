import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';
import type { components } from '../src/app/core/api/schema';
import { mockApi } from './support/api';

type RewardResponse = components['schemas']['RewardResponse'];

function reward(id: string, overrides: Partial<RewardResponse> = {}): RewardResponse {
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

/** Una página de un listado de la API. */
function paged<T>(content: T[], size: number, number = 0, totalElements = content.length) {
  return {
    content,
    page: { size, number, totalElements, totalPages: Math.ceil(totalElements / size) },
  };
}

function paramsOf(url: string): Record<string, string> {
  return Object.fromEntries(new URL(url).searchParams);
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
    const queries: Record<string, string>[] = [];
    let catalog = [IN_PROGRESS, reward('nueva')];
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/rewards?*': (route) => {
          queries.push(paramsOf(route.request().url()));
          return route.fulfill({ json: paged(catalog, 12) });
        },
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
    // En el catálogo, la que ya tiene racha no se puede volver a empezar.
    const available = page.getByRole('region', { name: 'Recompensas disponibles' });
    await expect(available.getByRole('listitem')).toHaveCount(2);
    await expect(
      available.getByRole('listitem').filter({ hasText: 'Recompensa constancia' }),
    ).toContainText('Racha en curso: 3 de 7 días');
    await expect(available.getByRole('button', { name: 'Empezar la racha' })).toHaveCount(1);
    await expect(available.getByRole('navigation')).toHaveCount(0);
    await expectNoA11yViolations(page);

    await page.getByRole('button', { name: 'Empezar la racha' }).click();
    await expect(page.getByText('Racha empezada')).toBeVisible();
    await expect(available.getByRole('button', { name: 'Empezar la racha' })).toHaveCount(0);

    await mine.getByRole('button', { name: 'Abandonar la racha' }).first().click();
    await page
      .getByRole('alertdialog', { name: 'Abandonar la racha' })
      .getByRole('button', { name: 'Abandonar' })
      .click();
    await expect(page.getByText('Racha abandonada')).toBeVisible();

    expect(calls).toEqual(['POST {"rewardId":"nueva"}', 'DELETE s1']);
    expect(queries[0]).toEqual({ page: '0', size: '12', sort: 'requiredStreakDays,asc' });
  });

  test('pasa las páginas del catálogo', async ({ page }) => {
    const pages: string[] = [];
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/rewards?*': (route) => {
          const number = Number(paramsOf(route.request().url())['page']);
          pages.push(String(number));
          const content =
            number === 0
              ? Array.from({ length: 12 }, (_, index) => reward(`r${index + 1}`))
              : [reward('r13', { title: 'La última de la lista' })];
          return route.fulfill({ json: paged(content, 12, number, 13) });
        },
        '/me/streaks': (route) => route.fulfill({ json: [] }),
      },
    });

    await page.goto('/client/rewards');
    const available = page.getByRole('region', { name: 'Recompensas disponibles' });
    await expect(available.getByRole('listitem')).toHaveCount(12);
    await expectNoA11yViolations(page);

    await available.getByRole('button', { name: 'Página siguiente' }).click();
    await expect(available.getByRole('listitem')).toHaveCount(1);
    await expect(available).toContainText('La última de la lista');
    expect(pages).toEqual(['0', '1']);
  });
});

test.describe('recompensas del nutricionista', () => {
  test('crea una recompensa con uno de sus planes publicados como premio', async ({ page }) => {
    let created: unknown;
    let mine: ReturnType<typeof reward>[] = [];
    const queries: Record<string, Record<string, string>> = {};
    await mockApi(page, {
      session: 'NUTRITIONIST',
      routes: {
        '/nutritionist/rewards': (route) => {
          created = route.request().postDataJSON();
          mine = [reward('creada', { title: 'Una semana constante' })];
          return route.fulfill({ status: 201, json: mine[0] });
        },
        '/nutritionist/rewards?*': (route) => {
          queries['rewards'] = paramsOf(route.request().url());
          return route.fulfill({ json: paged(mine, 12) });
        },
        '/nutritionist/content-items?*': (route) => {
          queries['content'] = paramsOf(route.request().url());
          return route.fulfill({ json: paged([], 100) });
        },
        // La API ya filtra lo publicado.
        '/nutritionist/meal-plans?*': (route) => {
          queries['plans'] = paramsOf(route.request().url());
          return route.fulfill({
            json: paged([{ id: 'p-pub', title: 'Semana ligera', status: 'PUBLISHED' }], 100),
          });
        },
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
    await expect(page.getByRole('heading', { name: 'Una semana constante' })).toBeVisible();
    expect(queries).toEqual({
      rewards: { page: '0', size: '12', sort: 'createdAt,desc' },
      content: { status: 'PUBLISHED', size: '100', sort: 'updatedAt,desc' },
      plans: { status: 'PUBLISHED', size: '100', sort: 'title,asc' },
    });
    expect(created).toEqual({
      title: 'Una semana constante',
      description: 'Siete días seguidos registrando hábitos.',
      requiredStreakDays: 7,
      contentItemId: null,
      mealPlanId: 'p-pub',
    });
  });
});
