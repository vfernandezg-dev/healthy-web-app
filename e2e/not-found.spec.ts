import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';
import { mockApi } from './support/api';

test('una ruta que no existe muestra la página 404, accesible', async ({ page }) => {
  await mockApi(page);
  await page.goto('/esta-ruta-no-existe');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Esta página no existe');
  await expect(page).toHaveTitle(/Página no encontrada/);
  await expectNoA11yViolations(page);
});
