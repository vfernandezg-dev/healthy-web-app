import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';
import { mockApi } from './support/api';

function client(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    firstName: 'Cliente',
    lastName: id,
    email: `${id}@correo.com`,
    heightCm: 170,
    weightKg: 65,
    plans: ['Semana ligera'],
    since: '2026-10-01T10:00:00Z',
    ...overrides,
  };
}

type Client = ReturnType<typeof client>;

/** Una página de la API, con `totalElements` en total (por defecto, los que trae). */
function paged(content: Client[], number = 0, totalElements = content.length) {
  return {
    content,
    page: { size: 20, number, totalElements, totalPages: Math.ceil(totalElements / 20) },
  };
}

/** Como en la API: sin mayúsculas ni tildes. */
function searchable(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** En el orden de la API: del más reciente al más antiguo. */
const CLIENTS = [
  client('maria', {
    firstName: 'María',
    lastName: 'López',
    email: 'maria.lopez@correo.com',
    heightCm: 182,
    weightKg: 90.4,
    plans: ['Volumen limpio', 'Semana ligera'],
    since: '2026-11-02T10:00:00Z',
  }),
  client('jose', {
    firstName: 'José',
    lastName: 'Pérez',
    email: 'jose.perez@correo.com',
    heightCm: null,
    weightKg: null,
    since: '2026-10-20T10:00:00Z',
  }),
  client('ana', {
    firstName: 'Ana',
    lastName: 'Ruiz',
    email: 'ana.ruiz@correo.com',
    since: '2026-09-15T10:00:00Z',
  }),
];

test.describe('clientes del nutricionista', () => {
  test('lista sus clientes y busca en la API', async ({ page }) => {
    const queries: Record<string, string>[] = [];
    await mockApi(page, {
      session: 'NUTRITIONIST',
      routes: {
        '/nutritionist/clients?*': (route) => {
          const params = Object.fromEntries(new URL(route.request().url()).searchParams);
          queries.push(params);
          const q = searchable(params['q'] ?? '');
          const found = CLIENTS.filter((c) =>
            searchable(`${c.firstName} ${c.lastName} ${c.email}`).includes(q),
          );
          return route.fulfill({ json: paged(found) });
        },
      },
    });

    await page.goto('/nutritionist/clients');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tus clientes');
    await expect(page.getByText('3 clientes')).toBeVisible();

    // Filas de clientes (en móvil no hay cabecera), en el orden de la API.
    const rows = page.getByRole('row').filter({ hasText: '@correo.com' });
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toContainText('María López');
    await expect(rows.nth(0)).toContainText('27,3');
    await expect(rows.nth(0)).toContainText('Sobrepeso');
    await expect(rows.nth(0)).toContainText('Volumen limpio');
    await expect(rows.nth(0).getByRole('link', { name: 'maria.lopez@correo.com' })).toHaveAttribute(
      'href',
      'mailto:maria.lopez@correo.com',
    );
    await expect(rows.nth(1)).toContainText('José Pérez');
    await expect(rows.nth(1)).toContainText('Sin datos');
    await expect(rows.nth(2)).toContainText('Ana Ruiz');
    await expect(rows.nth(2)).toContainText('22,5');
    // La API no ordena por columnas: ninguna cabecera se puede ordenar.
    await expect(page.locator('th[aria-sort]')).toHaveCount(0);
    await expectNoA11yViolations(page);

    const search = page.getByRole('searchbox', { name: 'Buscar clientes por nombre o correo' });
    await expect(search).toHaveAttribute('placeholder', 'Buscar por nombre o correo');
    await search.fill('perez');
    await expect(rows).toHaveCount(1);
    await expect(rows.nth(0)).toContainText('José Pérez');
    await expect(page.getByText('1 cliente', { exact: true })).toBeVisible();

    await search.fill('nadie');
    await expect(page.getByText('Ningún cliente coincide con la búsqueda.')).toBeVisible();
    await expect(page.getByText('Ningún cliente', { exact: true })).toBeVisible();
    // Sigue el buscador (no es que no tenga clientes).
    await expect(search).toBeVisible();
    await expect(page.getByText('Aún no tienes clientes')).toHaveCount(0);

    // Sin `sort` (orden fijo de la API) y con la búsqueda en `q`, tras dejar de escribir.
    expect(queries).toEqual([
      { page: '0', size: '20' },
      { page: '0', size: '20', q: 'perez' },
      { page: '0', size: '20', q: 'nadie' },
    ]);
  });

  test('pasa las páginas en la API y vuelve a la primera al buscar', async ({ page }) => {
    const queries: Record<string, string>[] = [];
    const many = Array.from({ length: 25 }, (_, index) =>
      client(`c${index + 1}`, { firstName: 'Cliente', lastName: `número ${index + 1}` }),
    );
    await mockApi(page, {
      session: 'NUTRITIONIST',
      routes: {
        '/nutritionist/clients?*': (route) => {
          const params = Object.fromEntries(new URL(route.request().url()).searchParams);
          queries.push(params);
          if (params['q']) {
            return route.fulfill({ json: paged([many[0]]) });
          }
          const number = Number(params['page']);
          return route.fulfill({
            json: paged(many.slice(number * 20, number * 20 + 20), number, many.length),
          });
        },
      },
    });

    await page.goto('/nutritionist/clients');
    const rows = page.getByRole('row').filter({ hasText: '@correo.com' });
    await expect(page.getByText('25 clientes')).toBeVisible();
    await expect(rows).toHaveCount(20);

    await page.getByRole('button', { name: 'Página siguiente' }).click();
    await expect(rows).toHaveCount(5);
    await expect(rows.nth(0)).toContainText('Cliente número 21');
    await expectNoA11yViolations(page);

    await page.getByRole('searchbox', { name: 'Buscar clientes' }).fill('número 1');
    await expect(rows).toHaveCount(1);
    expect(queries).toEqual([
      { page: '0', size: '20' },
      { page: '1', size: '20' },
      { page: '0', size: '20', q: 'número 1' },
    ]);
  });

  test('sin clientes, invita a publicar planes', async ({ page }) => {
    await mockApi(page, {
      session: 'NUTRITIONIST',
      routes: { '/nutritionist/clients?*': (route) => route.fulfill({ json: paged([]) }) },
    });

    await page.goto('/nutritionist/clients');
    await expect(page.getByText('Aún no tienes clientes')).toBeVisible();
    await expect(page.getByRole('searchbox')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Ver tus planes' })).toHaveAttribute(
      'href',
      '/nutritionist/meal-plans',
    );
    await expectNoA11yViolations(page);
  });
});
