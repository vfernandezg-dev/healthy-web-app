import type { Routes } from '@angular/router';

/** /client/content: catálogo y detalle por slug. */
export const CLIENT_CONTENT_ROUTES: Routes = [
  {
    path: '',
    title: 'Contenido',
    loadComponent: () => import('./client/content-catalog').then((m) => m.ContentCatalog),
  },
  {
    path: ':slug',
    title: 'Contenido',
    loadComponent: () => import('./client/content-detail').then((m) => m.ContentDetail),
  },
];

/** /nutritionist/content: su contenido, alta y editor. */
export const NUTRITIONIST_CONTENT_ROUTES: Routes = [
  {
    path: '',
    title: 'Tu contenido',
    loadComponent: () =>
      import('./nutritionist/nutritionist-content').then((m) => m.NutritionistContent),
  },
  {
    path: 'new',
    title: 'Nuevo contenido',
    loadComponent: () => import('./nutritionist/content-new').then((m) => m.ContentNew),
  },
  {
    path: ':id',
    title: 'Editar el contenido',
    loadComponent: () => import('./nutritionist/content-editor').then((m) => m.ContentEditor),
  },
];
