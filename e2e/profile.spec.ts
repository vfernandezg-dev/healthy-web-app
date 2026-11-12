import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';
import { mockApi, problem, requestBody } from './support/api';

const CLIENT_ME = {
  id: '00000000-0000-7000-8000-000000000005',
  email: 'maria.lopez@healthybites.com',
  firstName: 'María',
  lastName: 'López',
  role: 'CLIENT',
  client: { sex: 'FEMALE', birthDate: '1995-04-20', heightCm: 165, weightKg: 62.5, age: 31 },
  nutritionist: null,
};

test.describe('perfil', () => {
  test('un cliente ve y guarda sus datos', async ({ page }) => {
    let saved: Record<string, unknown> | undefined;
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/me': (route) => route.fulfill({ json: CLIENT_ME }),
        '/me/profile': (route) => {
          saved = requestBody<Record<string, unknown>>(route);
          return route.fulfill({
            json: {
              ...CLIENT_ME,
              firstName: 'Mariana',
              client: { ...CLIENT_ME.client, weightKg: 60 },
            },
          });
        },
      },
    });

    await page.goto('/client/profile');
    await expect(page.getByRole('heading', { level: 1, name: 'Tu perfil' })).toBeVisible();
    await expect(page.getByLabel('Nombre')).toHaveValue('María');
    await expect(page.getByLabel('Fecha de nacimiento')).toHaveValue('1995-04-20');
    await expect(page.getByText(/Tienes \d+ años\./)).toBeVisible();
    await expectNoA11yViolations(page);

    await page.getByLabel('Nombre').fill('Mariana');
    await page.getByLabel('Peso').fill('60');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.getByText('Perfil guardado')).toBeVisible();
    expect(saved).toEqual({
      firstName: 'Mariana',
      lastName: 'López',
      bio: null,
      client: { sex: 'FEMALE', birthDate: '1995-04-20', heightCm: 165, weightKg: 60 },
    });
  });

  test('avisa de los valores fuera de rango antes de enviar', async ({ page }) => {
    await mockApi(page, {
      session: 'CLIENT',
      routes: { '/me': (route) => route.fulfill({ json: CLIENT_ME }) },
    });
    await page.goto('/client/profile');

    // La altura no admite más de 260: el propio campo la limita al salir de él.
    await page.getByLabel('Altura').fill('300');
    await page.getByLabel('Altura').blur();
    await expect(page.getByLabel('Altura')).toHaveValue('260 cm');

    await page.getByLabel('Fecha de nacimiento').fill('2999-01-01');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.getByText('La fecha de nacimiento debe ser anterior a hoy')).toBeVisible();
    await expect(page.getByLabel('Fecha de nacimiento')).toBeFocused();
  });

  test('cambiar la contraseña marca la actual si no es correcta', async ({ page }) => {
    let attempts = 0;
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/me': (route) => route.fulfill({ json: CLIENT_ME }),
        '/me/password': (route) => {
          attempts += 1;
          return attempts === 1
            ? route.fulfill(
                problem(422, 'wrong-current-password', 'La contraseña actual no es correcta', {
                  errors: [
                    { field: 'currentPassword', message: 'La contraseña actual no es correcta' },
                  ],
                }),
              )
            : route.fulfill({
                json: {
                  accessToken: 'token-nuevo',
                  tokenType: 'Bearer',
                  expiresIn: 900,
                  user: { ...CLIENT_ME, role: 'CLIENT' },
                },
              });
        },
      },
    });
    await page.goto('/client/profile');

    await page.getByLabel('Contraseña actual').fill('mal');
    await page.getByLabel('Contraseña nueva').fill('una-clave-larga');
    await page.getByRole('button', { name: 'Cambiar la contraseña' }).click();
    await expect(page.locator('#current-password-error')).toHaveText(
      'La contraseña actual no es correcta',
    );

    await page.getByLabel('Contraseña actual').fill('healthy123');
    await page.getByRole('button', { name: 'Cambiar la contraseña' }).click();
    await expect(
      page.getByText('Hemos cerrado tus sesiones en los demás dispositivos.'),
    ).toBeVisible();
    await expect(page.getByLabel('Contraseña actual')).toHaveValue('');
  });

  test('un nutricionista edita su presentación', async ({ page }) => {
    let saved: Record<string, unknown> | undefined;
    const me = {
      id: '00000000-0000-7000-8000-000000000002',
      email: 'carlos.garcia@healthybites.com',
      firstName: 'Carlos',
      lastName: 'García',
      role: 'NUTRITIONIST',
      client: null,
      nutritionist: { bio: 'Nutrición deportiva.' },
    };
    await mockApi(page, {
      session: 'NUTRITIONIST',
      routes: {
        '/me': (route) => route.fulfill({ json: me }),
        '/me/profile': (route) => {
          saved = requestBody<Record<string, unknown>>(route);
          return route.fulfill({ json: me });
        },
      },
    });

    await page.goto('/nutritionist/profile');
    await expect(page.getByLabel('Altura')).toHaveCount(0);
    await page.getByLabel('Presentación').fill('Nutrición deportiva y vegetariana.');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.getByText('Perfil guardado')).toBeVisible();
    expect(saved).toEqual({
      firstName: 'Carlos',
      lastName: 'García',
      bio: 'Nutrición deportiva y vegetariana.',
      client: null,
    });
  });

  test('si no se puede cargar, ofrece reintentar', async ({ page }) => {
    let calls = 0;
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/me': (route) => {
          calls += 1;
          return calls === 1
            ? route.fulfill(problem(503, 'unavailable', 'El servicio no está disponible'))
            : route.fulfill({ json: CLIENT_ME });
        },
      },
    });

    await page.goto('/client/profile');
    await expect(page.getByText('El servicio no está disponible')).toBeVisible();
    await page.getByRole('button', { name: 'Reintentar' }).click();
    await expect(page.getByLabel('Nombre')).toHaveValue('María');
  });
});
