import type { Page, Route } from '@playwright/test';
import type { SessionResponse, SessionUser, components } from '../../src/app/core/api/schema';

/** Tipos del contrato de la API. */
export type Schemas = components['schemas'];

export type Role = SessionUser['role'];

const USERS: Record<Role, SessionUser> = {
  CLIENT: {
    id: '00000000-0000-7000-8000-000000000005',
    email: 'maria.lopez@healthybites.com',
    firstName: 'María',
    lastName: 'López',
    role: 'CLIENT',
  },
  NUTRITIONIST: {
    id: '00000000-0000-7000-8000-000000000002',
    email: 'carlos.garcia@healthybites.com',
    firstName: 'Carlos',
    lastName: 'García',
    role: 'NUTRITIONIST',
  },
  ADMIN: {
    id: '00000000-0000-7000-8000-000000000001',
    email: 'admin@healthybites.com',
    firstName: 'Admin',
    lastName: 'Healthy Bites',
    role: 'ADMIN',
  },
};

export function sessionFor(
  role: Role,
  accessToken = `token-${role.toLowerCase()}`,
): SessionResponse {
  return { accessToken, tokenType: 'Bearer', expiresIn: 900, user: USERS[role] };
}

/** Respuesta de error con el formato de la API (RFC 9457 + code). */
export function problem(status: number, code: string, detail: string, extra: object = {}) {
  return {
    status,
    contentType: 'application/problem+json',
    body: JSON.stringify({ status, code, detail, title: code, ...extra }),
  };
}

export type Handler = (route: Route) => Promise<void> | void;

/** Cuerpo JSON de la petición con el tipo del contrato (Playwright lo devuelve como `any`). */
export function requestBody<T>(route: Route): T {
  return route.request().postDataJSON() as T;
}

/**
 * Simula la API. Cualquier petición sin manejador responde 501 (el test falla de forma visible). Por defecto no hay
 * sesión: /auth/refresh responde 401. Las rutas se registran en orden inverso a como las comprueba Playwright, así
 * que los manejadores específicos van después del de por defecto.
 */
export async function mockApi(
  page: Page,
  options: { session?: Role | null; routes?: Record<string, Handler> } = {},
): Promise<void> {
  await page.route('**/api/v1/**', (route) =>
    route.fulfill(
      problem(
        501,
        'not-mocked',
        `Sin simular: ${route.request().method()} ${route.request().url()}`,
      ),
    ),
  );
  await page.route('**/api/v1/auth/refresh', (route) =>
    options.session
      ? route.fulfill({ json: sessionFor(options.session) })
      : route.fulfill(problem(401, 'invalid-refresh-token', 'No hay sesión')),
  );
  await page.route('**/api/v1/auth/logout', (route) => route.fulfill({ status: 204 }));
  for (const [pattern, handler] of Object.entries(options.routes ?? {})) {
    await page.route(`**/api/v1${pattern}`, handler);
  }
}

/** En móvil el menú está en un cajón: lo abre si hace falta. */
export async function openNavigation(page: Page, isMobile: boolean): Promise<void> {
  if (isMobile) {
    await page.getByRole('button', { name: 'Abrir el menú' }).click();
  }
}
