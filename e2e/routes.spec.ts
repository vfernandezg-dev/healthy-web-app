import { type Route, expect, test } from './support/test';
import { expectNoA11yViolations } from './support/a11y';
import { type Role, mockApi } from './support/api';
import { readsFor } from './support/fixtures';

interface RouteCase {
  readonly path: string;
  /** Título de la pestaña sin « · Healthy Bites». */
  readonly title: string;
}

/** Todas las rutas de la app, por rol (PUBLIC: sin sesión). */
const ROUTES: Readonly<Record<Role | 'PUBLIC', readonly RouteCase[]>> = {
  PUBLIC: [
    { path: '/auth/login', title: 'Inicia sesión' },
    { path: '/auth/register', title: 'Crea tu cuenta' },
    { path: '/auth/forgot-password', title: 'Recupera tu contraseña' },
    { path: '/auth/reset-password#token=abc', title: 'Elige una contraseña nueva' },
    { path: '/auth/accept-invitation#token=abc', title: 'Únete como nutricionista' },
    { path: '/esta-ruta-no-existe', title: 'Página no encontrada' },
  ],
  CLIENT: [
    { path: '/client', title: 'Inicio' },
    { path: '/client/profile', title: 'Tu perfil' },
    { path: '/client/progress', title: 'Tu progreso' },
    { path: '/client/habits', title: 'Tus hábitos' },
    { path: '/client/rewards', title: 'Recompensas' },
    { path: '/client/meal-plans', title: 'Planes alimenticios' },
    { path: '/client/meal-plans/plan-1', title: 'Semana ligera' },
    { path: '/client/content', title: 'Contenido' },
    { path: '/client/content/guia-de-la-compra', title: 'Guía de la compra' },
    { path: '/client/community', title: 'Comunidad' },
    { path: '/client/community/groups/group-1', title: 'Recetas saludables' },
    { path: '/client/subscription', title: 'Suscripción' },
    { path: '/client/subscription/checkout/return?token=ORDER-1', title: 'Confirmando el pago' },
    { path: '/client/subscription/checkout/cancel', title: 'Pago cancelado' },
  ],
  NUTRITIONIST: [
    { path: '/nutritionist', title: 'Inicio' },
    { path: '/nutritionist/profile', title: 'Tu perfil' },
    { path: '/nutritionist/meal-plans', title: 'Tus planes' },
    { path: '/nutritionist/meal-plans/new', title: 'Nuevo plan' },
    { path: '/nutritionist/meal-plans/plan-1', title: 'Editar el plan' },
    { path: '/nutritionist/content', title: 'Tu contenido' },
    { path: '/nutritionist/content/new', title: 'Nuevo contenido' },
    { path: '/nutritionist/content/content-1', title: 'Editar el contenido' },
    { path: '/nutritionist/rewards', title: 'Tus recompensas' },
    { path: '/nutritionist/clients', title: 'Tus clientes' },
    { path: '/nutritionist/community', title: 'Comunidad' },
    { path: '/nutritionist/community/groups/group-1', title: 'Recetas saludables' },
  ],
  ADMIN: [
    { path: '/admin', title: 'Resumen' },
    { path: '/admin/users', title: 'Usuarios' },
    { path: '/admin/invitations', title: 'Invitaciones' },
    { path: '/admin/moderation', title: 'Moderación' },
    { path: '/admin/billing', title: 'Facturación' },
  ],
};

for (const [group, cases] of Object.entries(ROUTES) as [Role | 'PUBLIC', RouteCase[]][]) {
  test.describe(`todas las rutas: ${group.toLowerCase()}`, () => {
    for (const { path, title } of cases) {
      test(`${path} carga con su título, un h1 y sin errores de accesibilidad`, async ({
        page,
      }) => {
        const role = group === 'PUBLIC' ? null : group;
        const unmocked: string[] = [];
        const errors: string[] = [];
        page.on('response', (response) => {
          if (response.status() === 501 && response.url().includes('/api/v1/')) {
            unmocked.push(`${response.request().method()} ${response.url()}`);
          }
        });
        page.on('pageerror', (error) => errors.push(error.message));

        const routes = Object.fromEntries(
          Object.entries(readsFor(role ?? 'CLIENT')).flatMap(([pattern, json]) => [
            [pattern, (route: Route) => route.fulfill({ json })],
            [`${pattern}?*`, (route: Route) => route.fulfill({ json })],
          ]),
        );
        await mockApi(page, { session: role, routes });

        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
        await expect(page).toHaveTitle(`${title} · Healthy Bites`);
        await page.waitForLoadState('networkidle');
        await expectNoA11yViolations(page);
        expect(unmocked, 'peticiones sin simular').toEqual([]);
        expect(errors, 'errores de la página').toEqual([]);
      });
    }
  });
}
