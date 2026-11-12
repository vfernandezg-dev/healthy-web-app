import { expect, test } from '@playwright/test';
import { freshPage, lastMailTo, login, logout } from './support';

/**
 * Recorridos contra la API real con los datos de demostración. Comparten la base de datos, así que van en orden:
 * la denuncia que hace la clienta la resuelve después el ADMIN. Lo que crean lleva un sufijo único.
 */
test.describe.serial('recorridos contra la API real', () => {
  const stamp = Date.now().toString(36);
  const postTitle = `Mi semana ${stamp}`;
  const reportReason = `Prueba de moderación ${stamp}`;

  test('cliente: panel, sesión al recargar, hábitos, pesaje, contenido y comunidad', async ({
    page,
  }) => {
    await login(page, 'maria.lopez@healthybites.com');
    await expect(page).toHaveURL(/\/client$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Hola, María' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Tu meta' })).toContainText('Mantener 58 kg');
    await expect(page.getByRole('region', { name: 'Tu plan' })).toContainText('Premium');

    // La sesión vuelve con la cookie de refresh al recargar (el access token solo vive en memoria).
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Hola, María' })).toBeVisible();

    await page.goto('/client/habits');
    await page.getByRole('button', { name: 'Registrar el día' }).click();
    await expect(page.getByText('¡Día registrado!')).toBeVisible();

    await page.goto('/client/progress');
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
    await page.getByLabel('Día', { exact: true }).fill(today);
    await page.getByLabel('Peso', { exact: true }).fill('59,8');
    await page.getByRole('button', { name: 'Añadir' }).click();
    await expect(page.getByText('Pesaje añadido')).toBeVisible();

    // Premium abre lo Premium, pero no lo VIP.
    await page.goto('/client/content/como-interpretar-tu-composicion-corporal');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Cómo interpretar tu composición corporal',
    );
    await page.goto('/client/content/recetas-altas-en-proteina');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Este contenido es VIP');

    await page.goto('/client/community');
    await page.getByRole('link', { name: /Pérdida de peso/ }).click();
    await expect(page).toHaveTitle('Pérdida de peso · Healthy Bites');
    await page
      .getByRole('region', { name: 'Publicaciones' })
      .getByRole('button', { name: 'Publicar' })
      .click();
    const composer = page.getByRole('dialog', { name: 'Nueva publicación' });
    await composer.getByLabel('Título').fill(postTitle);
    await composer.getByLabel('Texto').fill('Esta semana he caminado todos los días.');
    await composer.getByRole('button', { name: 'Publicar' }).click();
    const post = page.getByRole('article', { name: postTitle });
    await expect(post).toBeVisible();

    await post.getByRole('button', { name: 'Comentarios' }).click();
    await post.getByLabel('Tu comentario').fill('¡A por la siguiente!');
    await post.getByRole('button', { name: 'Comentar', exact: true }).click();
    await expect(post.getByText('¡A por la siguiente!')).toBeVisible();

    await page
      .getByRole('article', { name: 'Mi primera semana' })
      .getByRole('button', { name: 'Denunciar', exact: true })
      .click();
    const report = page.getByRole('dialog', { name: 'Denunciar' });
    await report.getByLabel('Motivo').fill(reportReason);
    await report.getByRole('button', { name: 'Enviar la denuncia' }).click();
    await expect(page.getByText('Denuncia enviada')).toBeVisible();

    await logout(page);
  });

  test('nutricionista: crea un plan con una comida y lo publica', async ({ page }) => {
    await login(page, 'carlos.garcia@healthybites.com');
    await expect(page.getByRole('heading', { level: 1, name: 'Hola, Carlos' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Cifras' })).toContainText('Clientes');

    const planTitle = `Plan exprés ${stamp}`;
    await page.goto('/nutritionist/meal-plans/new');
    await page.getByLabel('Título').fill(planTitle);
    await page.getByLabel('Descripción').fill('Dos días para empezar a comer mejor.');
    await page.getByRole('combobox', { name: 'Objetivo' }).click();
    await page.getByRole('option', { name: 'Perder peso' }).click();
    await page.getByLabel('Duración').fill('2');
    await page.getByRole('button', { name: 'Crear y añadir comidas' }).click();
    await expect(page.getByRole('heading', { level: 1, name: planTitle })).toBeVisible();

    await page.getByRole('button', { name: 'Añadir comida al día 1' }).click();
    const dialog = page.getByRole('dialog', { name: 'Nueva comida' });
    await dialog.getByRole('combobox', { name: 'Momento del día' }).click();
    await page.getByRole('option', { name: 'Desayuno' }).click();
    await dialog.getByLabel('Plato').fill('Avena con fruta');
    await dialog.getByLabel('Calorías').fill('350');
    await dialog.getByRole('button', { name: 'Añadir' }).click();
    await expect(page.getByRole('region', { name: /Día 1/ })).toContainText('Avena con fruta');

    await page.getByRole('button', { name: 'Publicar' }).click();
    await expect(page.getByText('Publicado: está en el catálogo para los clientes.')).toBeVisible();

    await logout(page);
  });

  test('administración: modera, desactiva y reactiva una cuenta, e invita a una nutricionista', async ({
    page,
    browser,
    request,
  }) => {
    await login(page, 'admin@healthybites.com');
    await expect(page.getByRole('heading', { level: 1, name: 'Resumen' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Moderación' })).toContainText(
      'denuncias pendientes',
    );

    // La denuncia de la clienta: se oculta la publicación.
    await page.goto('/admin/moderation');
    const card = page.getByRole('listitem').filter({ hasText: reportReason });
    await card.getByRole('button', { name: 'Ocultar' }).click();
    const hide = page.getByRole('dialog', { name: 'Ocultar el contenido' });
    await hide.getByLabel('Nota para el registro').fill('Prueba E2E');
    await hide.getByRole('button', { name: 'Ocultar' }).click();
    await expect(page.getByText('Contenido oculto', { exact: true })).toBeVisible();
    await expect(card).toHaveCount(0);

    // Una cuenta desactivada no puede entrar; al reactivarla, sí.
    await page.goto('/admin/users');
    await page.getByRole('searchbox', { name: 'Buscar cuentas' }).fill('juan');
    await page.getByRole('button', { name: 'Desactivar la cuenta de Juan Pérez' }).click();
    await page
      .getByRole('alertdialog', { name: 'Desactivar la cuenta' })
      .getByRole('button', { name: 'Desactivar' })
      .click();
    await expect(page.getByText('Cuenta desactivada')).toBeVisible();

    const juan = await freshPage(browser);
    await login(juan, 'juan.perez@healthybites.com');
    // El mismo mensaje que con una contraseña incorrecta: no revela que la cuenta existe.
    await expect(juan.getByRole('alert')).toHaveText('Correo o contraseña incorrectos');
    await expect(juan).toHaveURL(/\/auth\/login$/);

    await page.getByRole('button', { name: 'Reactivar la cuenta de Juan Pérez' }).click();
    await expect(page.getByText('Cuenta reactivada')).toBeVisible();
    await juan.getByRole('button', { name: 'Entrar' }).click();
    await expect(juan).toHaveURL(/\/client$/);
    await juan.context().close();

    // Invitación: el enlace llega por correo y crea la cuenta de nutricionista.
    const email = `nutri-${stamp}@healthybites.test`;
    await page.goto('/admin/invitations');
    await page.getByRole('button', { name: 'Invitar', exact: true }).click();
    const invite = page.getByRole('dialog', { name: 'Invitar a un nutricionista' });
    await invite.getByLabel('Nombre').fill('Lucía');
    await invite.getByLabel('Apellidos').fill('Prueba');
    await invite.getByLabel('Correo electrónico').fill(email);
    await invite.getByRole('button', { name: 'Enviar la invitación' }).click();
    await expect(page.getByText('Invitación enviada')).toBeVisible();

    const mail = await lastMailTo(request, email);
    const link = mail.match(/https?:\/\/[^\s]+\/auth\/accept-invitation#token=[\w-]+/)?.[0];
    expect(link, 'enlace de la invitación en el correo').toBeTruthy();

    const lucia = await freshPage(browser);
    await lucia.goto(link ?? '');
    await expect(lucia.getByRole('heading', { level: 1, name: 'Hola, Lucía' })).toBeVisible();
    await lucia.getByLabel('Contraseña', { exact: true }).fill('una-clave-larga-y-segura');
    await lucia.getByRole('button', { name: 'Crear mi cuenta' }).click();
    await expect(lucia).toHaveURL(/\/nutritionist$/);
    await expect(lucia.getByRole('heading', { level: 1, name: 'Hola, Lucía' })).toBeVisible();
    await lucia.context().close();

    await logout(page);
  });

  test('landing: el formulario de contacto sigue respondiendo 204', async ({ request }) => {
    const response = await request.post('/api/v1/contact', {
      headers: { Origin: 'http://localhost:4321' },
      data: {
        nombre: 'Ana',
        apellido: 'Prueba',
        correo: 'ana.prueba@correo.com',
        mensaje: 'Hola, me gustaría saber más sobre los planes de Healthy Bites.',
        website: '',
      },
    });
    expect(response.status()).toBe(204);
  });
});
