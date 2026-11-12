import { inject } from '@angular/core';
import type { Routes } from '@angular/router';
import { AuthStore } from './core/auth/auth-store';
import { roleGuard } from './core/auth/guards';

const shell = () => import('./layout/app-shell/app-shell').then((m) => m.AppShell);
const roleHome = () => import('./features/home/role-home').then((m) => m.RoleHome);
const profile = () => import('./features/profile/profile-page').then((m) => m.ProfilePage);

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
    ],
  },
  {
    path: 'nutritionist',
    canMatch: [roleGuard('NUTRITIONIST')],
    loadComponent: shell,
    children: [
      { path: '', title: 'Inicio', loadComponent: roleHome },
      { path: 'profile', title: 'Tu perfil', loadComponent: profile },
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
