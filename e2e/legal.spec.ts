import { expect, test } from './support/test';
import { mockApi, openNavigation } from './support/api';

test.describe('políticas', () => {
  test('desde el login se llega a la privacidad y de ahí a la seguridad', async ({ page }) => {
    await mockApi(page);
    await page.goto('/auth/login');

    await expect(
      page.getByText('Healthy Bites es un proyecto académico y de portafolio'),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Privacidad' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Política de privacidad');
    await expect(page.getByRole('main')).toContainText('usa datos ficticios');

    await page
      .getByRole('navigation', { name: 'Políticas' })
      .getByRole('link', { name: 'Seguridad' })
      .click();
    await expect(page).toHaveURL(/\/seguridad$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Política de seguridad');
    await expect(
      page.getByRole('navigation', { name: 'Políticas' }).getByRole('link', { name: 'Seguridad' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('el registro enlaza la política de privacidad', async ({ page }) => {
    await mockApi(page);
    await page.goto('/auth/register');

    await expect(page.getByRole('link', { name: 'política de privacidad' })).toHaveAttribute(
      'href',
      '/privacidad',
    );
  });

  test('con sesión, el menú enlaza las políticas', async ({ page, isMobile }) => {
    await mockApi(page, { session: 'CLIENT' });
    await page.goto('/client');
    await expect(page.getByRole('heading', { level: 1, name: 'Hola, María' })).toBeVisible();

    // En móvil, los del cajón; en escritorio, los del menú lateral (los otros están ocultos).
    await openNavigation(page, isMobile);
    await expect(page.getByRole('link', { name: 'Privacidad' })).toHaveAttribute(
      'href',
      '/privacidad',
    );
    await expect(page.getByRole('link', { name: 'Seguridad' })).toHaveAttribute(
      'href',
      '/seguridad',
    );
  });

  test('security.txt publica el contacto y la política', async ({ request }) => {
    const response = await request.get('/.well-known/security.txt');

    expect(response.ok()).toBe(true);
    const body = await response.text();
    expect(body).toContain('Contact: mailto:projects@vfernandezg.dev');
    expect(body).toContain('Policy: https://app-healthybites.vfernandezg.dev/seguridad');
    expect(body).toMatch(/Expires: 20\d\d-/);
  });
});
