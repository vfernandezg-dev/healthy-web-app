import { expect, test } from './support/test';
import { expectNoA11yViolations } from './support/a11y';
import { mockApi, openNavigation } from './support/api';

test.describe('marco de la aplicación', () => {
  test('cada rol ve su menú, accesible', async ({ page, isMobile }) => {
    await mockApi(page, { session: 'ADMIN' });
    await page.goto('/');
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page).toHaveTitle('Resumen · Healthy Bites');
    await expectNoA11yViolations(page);

    await openNavigation(page, isMobile);
    const navigation = page.getByRole('navigation', { name: 'Principal' }).last();
    await expect(navigation.getByRole('link')).toHaveText([
      'Resumen',
      'Usuarios',
      'Invitaciones',
      'Moderación',
      'Facturación',
    ]);
    await expect(navigation.getByRole('link', { name: 'Resumen' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expectNoA11yViolations(page);
  });

  test('el enlace para saltar al contenido es lo primero al tabular', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Sin teclado en móvil');
    await mockApi(page, { session: 'CLIENT' });
    await page.goto('/client');
    await expect(page.getByRole('heading', { level: 1, name: 'Hola, María' })).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  });
});
