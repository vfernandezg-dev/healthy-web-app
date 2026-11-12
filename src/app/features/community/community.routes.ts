import type { Routes } from '@angular/router';

/**
 * /client/community y /nutritionist/community: directorio de grupos y página de cada grupo. La ruta del grupo es la
 * misma que enlazan los correos de la API ({rol}/community/groups/{id}).
 */
export const COMMUNITY_ROUTES: Routes = [
  {
    path: '',
    title: 'Comunidad',
    loadComponent: () => import('./community-directory').then((m) => m.CommunityDirectory),
  },
  {
    path: 'groups/:id',
    title: 'Grupo',
    loadComponent: () => import('./group-page').then((m) => m.GroupPage),
  },
];
