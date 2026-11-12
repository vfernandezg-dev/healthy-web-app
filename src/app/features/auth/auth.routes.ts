import type { Routes } from '@angular/router';
import { guestGuard } from '../../core/auth/guards';
import { AuthLayout } from '../../layout/auth-layout/auth-layout';

/** /auth: acceso, registro y recuperación de la cuenta. /auth/login y /auth/register los enlaza la landing. */
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      {
        path: 'login',
        title: 'Inicia sesión',
        canMatch: [guestGuard],
        loadComponent: () => import('./login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        title: 'Crea tu cuenta',
        canMatch: [guestGuard],
        loadComponent: () => import('./register/register').then((m) => m.Register),
      },
      {
        path: 'forgot-password',
        title: 'Recupera tu contraseña',
        canMatch: [guestGuard],
        loadComponent: () =>
          import('./forgot-password/forgot-password').then((m) => m.ForgotPassword),
      },
      {
        path: 'reset-password',
        title: 'Elige una contraseña nueva',
        loadComponent: () => import('./reset-password/reset-password').then((m) => m.ResetPassword),
      },
      {
        path: 'accept-invitation',
        title: 'Únete como nutricionista',
        loadComponent: () =>
          import('./accept-invitation/accept-invitation').then((m) => m.AcceptInvitation),
      },
    ],
  },
];
