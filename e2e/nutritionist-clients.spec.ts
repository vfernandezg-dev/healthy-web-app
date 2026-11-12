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

const CLIENTS = [
  client('ana', {
    firstName: 'Ana',
    lastName: 'Ruiz',
    email: 'ana.ruiz@correo.com',
    since: '2026-09-15T10:00:00Z',
  }),
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
];

test.describe('clientes del nutricionista', () => {
  test('lista, ordena y busca sus clientes', async ({ page, isMobile }) => {
    await mockApi(page, {
      session: 'NUTRITIONIST',
      routes: { '/nutritionist/clients': (route) => route.fulfill({ json: CLIENTS }) },
    });

    await page.goto('/nutritionist/clients');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tus clientes');
    await expect(page.getByText('3 clientes')).toBeVisible();

    // Filas de clientes (en móvil no hay cabecera), de la más reciente a la más antigua.
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
    await expectNoA11yViolations(page);

    if (!isMobile) {
      const byName = page.getByRole('columnheader', { name: 'Cliente', exact: true });
      await byName.click();
      await expect(byName).toHaveAttribute('aria-sort', 'ascending');
      await expect(rows.nth(0)).toContainText('Ana Ruiz');
      await expect(rows.nth(2)).toContainText('María López');
    }

    const search = page.getByRole('searchbox', { name: 'Buscar clientes' });
    await search.fill('perez');
    await expect(rows).toHaveCount(1);
    await expect(rows.nth(0)).toContainText('José Pérez');
    await expect(page.getByText('1 cliente', { exact: true })).toBeVisible();

    await search.fill('volumen');
    await expect(rows.nth(0)).toContainText('María López');

    await search.fill('nadie');
    await expect(page.getByText('Ningún cliente coincide con la búsqueda.')).toBeVisible();
    await expect(page.getByText('Ningún cliente', { exact: true })).toBeVisible();
  });

  test('sin clientes, invita a publicar planes', async ({ page }) => {
    await mockApi(page, {
      session: 'NUTRITIONIST',
      routes: { '/nutritionist/clients': (route) => route.fulfill({ json: [] }) },
    });

    await page.goto('/nutritionist/clients');
    await expect(page.getByText('Aún no tienes clientes')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ver tus planes' })).toHaveAttribute(
      'href',
      '/nutritionist/meal-plans',
    );
    await expectNoA11yViolations(page);
  });
});
