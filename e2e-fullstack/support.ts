import { type APIRequestContext, type Browser, type Page, expect } from '@playwright/test';

/** Contraseña de las cuentas de demostración de la API (perfil dev). */
export const DEMO_PASSWORD = 'healthy123';

/** API de Mailpit (los correos del perfil dev). */
const MAILPIT = process.env['MAILPIT_URL'] ?? 'http://localhost:8025';

export async function login(page: Page, email: string, password = DEMO_PASSWORD): Promise<void> {
  await page.goto('/auth/login');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

export async function logout(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);
}

/** Una página en un contexto nuevo (sin la sesión de la página principal). */
export async function freshPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({
    baseURL: 'http://localhost:4310',
    locale: 'es-ES',
    timezoneId: 'America/Lima',
    reducedMotion: 'reduce',
  });
  return context.newPage();
}

/** Texto plano del último correo enviado a `address` (espera a que llegue). */
export async function lastMailTo(request: APIRequestContext, address: string): Promise<string> {
  const search = `${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${address}`)}`;
  let id: string | undefined;
  await expect
    .poll(
      async () => {
        const result = (await (await request.get(search)).json()) as {
          messages?: { ID: string }[];
        };
        id = result.messages?.[0]?.ID;
        return id;
      },
      { timeout: 15_000, message: `no llega ningún correo a ${address}` },
    )
    .toBeTruthy();
  const message = (await (await request.get(`${MAILPIT}/api/v1/message/${id}`)).json()) as {
    Text: string;
  };
  return message.Text;
}
