import { inject } from '@angular/core';
import { type CanMatchFn, Router } from '@angular/router';
import { AuthStore } from './auth-store';
import type { Role } from './roles';

/**
 * Solo para el rol indicado. Sin sesión, al login (recordando la ruta pedida); con otro rol, a su página de
 * inicio. Con `canMatch`, el código de las rutas de otros roles ni siquiera se descarga.
 */
export function roleGuard(role: Role): CanMatchFn {
  return () => {
    const auth = inject(AuthStore);
    const router = inject(Router);
    const user = auth.user();
    if (!user) {
      const requested = router.currentNavigation()?.extractedUrl.toString();
      return router.createUrlTree(['/auth/login'], {
        queryParams: requested && requested !== '/' ? { returnUrl: requested } : {},
      });
    }
    return user.role === role ? true : router.parseUrl(auth.homeUrl());
  };
}

/** Páginas para quien no ha iniciado sesión (login, registro...): con sesión, a la página de inicio. */
export const guestGuard: CanMatchFn = () => {
  const auth = inject(AuthStore);
  return auth.isAuthenticated() ? inject(Router).parseUrl(auth.homeUrl()) : true;
};
