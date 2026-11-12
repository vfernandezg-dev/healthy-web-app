import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '**',
    title: 'Página no encontrada',
    loadComponent: () => import('./layout/not-found/not-found').then((m) => m.NotFound),
  },
];
