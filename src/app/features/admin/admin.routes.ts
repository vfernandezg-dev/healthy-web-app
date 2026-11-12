import type { Routes } from '@angular/router';

/** /admin: cuentas, invitaciones de nutricionistas, moderación y facturación (el resumen va en la raíz). */
export const ADMIN_ROUTES: Routes = [
  {
    path: 'users',
    title: 'Usuarios',
    loadComponent: () => import('./users/users-page').then((m) => m.UsersPage),
  },
  {
    path: 'invitations',
    title: 'Invitaciones',
    loadComponent: () => import('./invitations/invitations-page').then((m) => m.InvitationsPage),
  },
  {
    path: 'moderation',
    title: 'Moderación',
    loadComponent: () => import('./moderation/moderation-page').then((m) => m.ModerationPage),
  },
  {
    path: 'billing',
    title: 'Facturación',
    loadComponent: () => import('./billing/billing-page').then((m) => m.BillingPage),
  },
];
