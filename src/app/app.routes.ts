import { inject } from '@angular/core';
import type { Routes } from '@angular/router';
import { AuthStore } from './core/auth/auth-store';
import { roleGuard } from './core/auth/guards';

const shell = () => import('./layout/app-shell/app-shell').then((m) => m.AppShell);
const roleHome = () => import('./features/home/role-home').then((m) => m.RoleHome);
const profile = () => import('./features/profile/profile-page').then((m) => m.ProfilePage);
const mealPlans = () => import('./features/meal-plans/meal-plans.routes');
const content = () => import('./features/content/content.routes');
const community = () =>
  import('./features/community/community.routes').then((m) => m.COMMUNITY_ROUTES);

/**
 * Rutas por rol (/client, /nutritionist, /admin) con canMatch: el código de las áreas de otros roles ni se
 * descarga. Cada área carga sus funcionalidades de forma diferida.
 */
export const routes: Routes = [
  // Con sesión, a la página de inicio de su rol; sin ella, al login.
  { path: '', pathMatch: 'full', redirectTo: () => inject(AuthStore).homeUrl() },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'client',
    canMatch: [roleGuard('CLIENT')],
    loadComponent: shell,
    children: [
      { path: '', title: 'Inicio', loadComponent: roleHome },
      { path: 'profile', title: 'Tu perfil', loadComponent: profile },
      {
        path: 'subscription',
        loadChildren: () =>
          import('./features/subscription/subscription.routes').then((m) => m.SUBSCRIPTION_ROUTES),
      },
      {
        path: 'meal-plans',
        loadChildren: () => mealPlans().then((m) => m.CLIENT_MEAL_PLAN_ROUTES),
      },
      { path: 'content', loadChildren: () => content().then((m) => m.CLIENT_CONTENT_ROUTES) },
      {
        path: 'progress',
        loadChildren: () =>
          import('./features/progress/progress.routes').then((m) => m.PROGRESS_ROUTES),
      },
      {
        path: 'habits',
        title: 'Tus hábitos',
        loadComponent: () => import('./features/habits/habits-page').then((m) => m.HabitsPage),
      },
      {
        path: 'rewards',
        title: 'Recompensas',
        loadComponent: () =>
          import('./features/rewards/client/rewards-page').then((m) => m.RewardsPage),
      },
      { path: 'community', loadChildren: community },
    ],
  },
  {
    path: 'nutritionist',
    canMatch: [roleGuard('NUTRITIONIST')],
    loadComponent: shell,
    children: [
      { path: '', title: 'Inicio', loadComponent: roleHome },
      { path: 'profile', title: 'Tu perfil', loadComponent: profile },
      {
        path: 'meal-plans',
        loadChildren: () => mealPlans().then((m) => m.NUTRITIONIST_MEAL_PLAN_ROUTES),
      },
      {
        path: 'content',
        loadChildren: () => content().then((m) => m.NUTRITIONIST_CONTENT_ROUTES),
      },
      {
        path: 'rewards',
        title: 'Tus recompensas',
        loadComponent: () =>
          import('./features/rewards/nutritionist/nutritionist-rewards').then(
            (m) => m.NutritionistRewards,
          ),
      },
      { path: 'community', loadChildren: community },
    ],
  },
  {
    path: 'admin',
    canMatch: [roleGuard('ADMIN')],
    loadComponent: shell,
    children: [{ path: '', title: 'Resumen', loadComponent: roleHome }],
  },
  {
    path: '**',
    title: 'Página no encontrada',
    loadComponent: () => import('./layout/not-found/not-found').then((m) => m.NotFound),
  },
];
