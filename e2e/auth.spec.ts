import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';
import { mockApi, openNavigation, problem, sessionFor } from './support/api';

test.describe('acceso', () => {
  test('una página privada sin sesión lleva al login y, al entrar, vuelve a ella', async ({
    page,
  }) => {
    await mockApi(page, {
      routes: {
        '/auth/login': (route) => route.fulfill({ json: sessionFor('CLIENT') }),
      },
    });

    await page.goto('/client');
    await expect(page).toHaveURL(/\/auth\/login\?returnUrl=%2Fclient$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Inicia sesión' })).toBeVisible();
    await expectNoA11yViolations(page);

    await page.getByLabel('Correo electrónico').fill('maria.lopez@healthybites.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('healthy123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/client$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Hola, María' })).toBeVisible();
    await expect(page).toHaveTitle('Inicio · Healthy Bites');
    await expectNoA11yViolations(page);
  });

  test('sin datos, cada campo dice qué falta y el foco va al primero', async ({ page }) => {
    await mockApi(page);
    await page.goto('/auth/login');

    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Escribe tu correo')).toBeVisible();
    await expect(page.getByText('Escribe tu contraseña')).toBeVisible();
    await expect(page.getByLabel('Correo electrónico')).toBeFocused();
    await expect(page.getByLabel('Correo electrónico')).toHaveAttribute(
      'aria-describedby',
      'login-email-error',
    );
    await expectNoA11yViolations(page);
  });

  test('con credenciales incorrectas muestra el mensaje de la API', async ({ page }) => {
    await mockApi(page, {
      routes: {
        '/auth/login': (route) =>
          route.fulfill(
            problem(401, 'bad-credentials', 'El correo o la contraseña no son correctos'),
          ),
      },
    });
    await page.goto('/auth/login');

    await page.getByLabel('Correo electrónico').fill('maria.lopez@healthybites.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('otra-clave');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('El correo o la contraseña no son correctos')).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('la contraseña se puede mostrar en claro', async ({ page }) => {
    await mockApi(page);
    await page.goto('/auth/login');
    const password = page.getByLabel('Contraseña', { exact: true });

    await password.fill('secreta');
    await expect(password).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Mostrar contraseña' }).click();
    await expect(password).toHaveAttribute('type', 'text');
    await expect(page.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('un cliente no entra en las áreas de otros roles', async ({ page }) => {
    await mockApi(page, { session: 'CLIENT' });

    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/client$/);

    await page.goto('/auth/login');
    await expect(page).toHaveURL(/\/client$/);
  });

  test('cerrar sesión vuelve al login', async ({ page, isMobile }) => {
    await mockApi(page, { session: 'NUTRITIONIST' });
    await page.goto('/');
    await expect(page).toHaveURL(/\/nutritionist$/);

    await openNavigation(page, isMobile);
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});

test.describe('cuenta nueva', () => {
  test('el registro crea la cuenta, inicia sesión y da la bienvenida', async ({ page }) => {
    let registered: unknown;
    await mockApi(page, {
      routes: {
        '/auth/register': (route) => {
          registered = route.request().postDataJSON();
          return route.fulfill({ status: 201, json: { id: 'x', email: 'ana@correo.com' } });
        },
        '/auth/login': (route) => route.fulfill({ json: sessionFor('CLIENT') }),
      },
    });
    await page.goto('/auth/register');
    await expectNoA11yViolations(page);

    await page.getByLabel('Nombre').fill('Ana');
    await page.getByLabel('Apellido').fill('Torres');
    await page.getByLabel('Correo electrónico').fill('ana@correo.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('corta');
    await expect(page.getByText('Al menos 10 caracteres')).toBeVisible();
    await page.getByLabel('Contraseña', { exact: true }).fill('una-clave-larga');
    await expect(page.getByText('Tiene 10 caracteres o más')).toBeVisible();
    await page.getByRole('button', { name: 'Crear mi cuenta' }).click();

    await expect(page).toHaveURL(/\/client$/);
    await expect(page.getByText('Tu cuenta está lista.')).toBeVisible();
    expect(registered).toEqual({
      firstName: 'Ana',
      lastName: 'Torres',
      email: 'ana@correo.com',
      password: 'una-clave-larga',
    });
  });

  test('un correo ya registrado se marca en su campo', async ({ page }) => {
    await mockApi(page, {
      routes: {
        '/auth/register': (route) =>
          route.fulfill(
            problem(422, 'validation-failed', 'Revisa los datos del formulario', {
              errors: [{ field: 'email', message: 'Ya hay una cuenta con ese correo' }],
            }),
          ),
      },
    });
    await page.goto('/auth/register');

    await page.getByLabel('Nombre').fill('Ana');
    await page.getByLabel('Apellido').fill('Torres');
    await page.getByLabel('Correo electrónico').fill('maria.lopez@healthybites.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('una-clave-larga');
    await page.getByRole('button', { name: 'Crear mi cuenta' }).click();

    await expect(page.locator('#register-email-error')).toHaveText(
      'Ya hay una cuenta con ese correo',
    );
  });

  test('un nutricionista acepta su invitación con el token del enlace', async ({ page }) => {
    let accepted: unknown;
    await mockApi(page, {
      routes: {
        '/auth/invitations/preview': (route) =>
          route.fulfill({
            json: {
              email: 'carlos.garcia@healthybites.com',
              firstName: 'Carlos',
              lastName: 'García',
            },
          }),
        '/auth/invitations/accept': (route) => {
          accepted = route.request().postDataJSON();
          return route.fulfill({ json: { email: 'carlos.garcia@healthybites.com' } });
        },
        '/auth/login': (route) => route.fulfill({ json: sessionFor('NUTRITIONIST') }),
      },
    });

    await page.goto('/auth/accept-invitation#token=invitacion-123');
    await expect(page.getByRole('heading', { level: 1, name: 'Hola, Carlos' })).toBeVisible();
    // El token sale de la barra de direcciones en cuanto se lee.
    expect(new URL(page.url()).hash).toBe('');
    await expectNoA11yViolations(page);

    await page.getByLabel('Contraseña', { exact: true }).fill('una-clave-larga');
    await page.getByLabel('Preséntate a tus clientes').fill('Nutrición deportiva.');
    await page.getByRole('button', { name: 'Crear mi cuenta' }).click();

    await expect(page).toHaveURL(/\/nutritionist$/);
    expect(accepted).toEqual({
      token: 'invitacion-123',
      password: 'una-clave-larga',
      bio: 'Nutrición deportiva.',
    });
  });

  test('una invitación caducada lo explica', async ({ page }) => {
    await mockApi(page, {
      routes: {
        '/auth/invitations/preview': (route) =>
          route.fulfill(problem(410, 'invitation-expired', 'La invitación ha caducado.')),
      },
    });

    await page.goto('/auth/accept-invitation#token=vieja');

    await expect(
      page.getByRole('heading', { level: 1, name: 'La invitación no es válida' }),
    ).toBeVisible();
    await expect(page.getByText('La invitación ha caducado.')).toBeVisible();
  });
});

test.describe('recuperar la contraseña', () => {
  test('pedir el enlace confirma sin revelar si la cuenta existe', async ({ page }) => {
    await mockApi(page, {
      routes: { '/auth/forgot-password': (route) => route.fulfill({ status: 202 }) },
    });
    await page.goto('/auth/login');
    await page.getByRole('link', { name: '¿Has olvidado tu contraseña?' }).click();

    await page.getByLabel('Correo electrónico').fill('nadie@correo.com');
    await page.getByRole('button', { name: 'Enviar el enlace' }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'Revisa tu correo' })).toBeVisible();
    await expect(page.getByText('Si hay una cuenta con nadie@correo.com')).toBeVisible();
  });

  test('el enlace del correo permite elegir una contraseña nueva', async ({ page }) => {
    let body: unknown;
    await mockApi(page, {
      routes: {
        '/auth/reset-password': (route) => {
          body = route.request().postDataJSON();
          return route.fulfill({ status: 204 });
        },
      },
    });

    await page.goto('/auth/reset-password#token=enlace-abc');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Elige una contraseña nueva' }),
    ).toBeVisible();
    expect(new URL(page.url()).hash).toBe('');
    await expectNoA11yViolations(page);
    await page.getByLabel('Contraseña nueva').fill('otra-clave-larga');
    await page.getByRole('button', { name: 'Guardar la contraseña' }).click();

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByText('Ya puedes iniciar sesión con la nueva.')).toBeVisible();
    expect(body).toEqual({ token: 'enlace-abc', password: 'otra-clave-larga' });
  });

  test('sin token, explica que el enlace no es válido', async ({ page }) => {
    await mockApi(page);
    await page.goto('/auth/reset-password');
    await expect(
      page.getByRole('heading', { level: 1, name: 'El enlace no es válido' }),
    ).toBeVisible();
  });
});
