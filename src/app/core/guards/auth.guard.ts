import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role, homeFor } from './role-home';

/** Exige sesión. Sin ella, al login recordando la URL pedida (antes provocaba un bucle de redirecciones). */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? true : loginRedirect(state.url);
};

/**
 * Exige sesión y un rol concreto (canMatch: con otro rol, ni siquiera se descarga el código del área).
 * Con un rol distinto, a la página de inicio de su propio rol.
 */
export function roleGuard(role: Role): CanMatchFn {
  return (_route, segments: UrlSegment[]) => {
    const auth = inject(AuthService);
    if (!auth.isAuthenticated()) {
      return loginRedirect('/' + segments.map(segment => segment.path).join('/'));
    }
    return auth.getUserRole() === role ? true : inject(Router).parseUrl(auth.homeUrl());
  };
}

function loginRedirect(returnUrl: string) {
  return inject(Router).createUrlTree(['/auth/login'], { queryParams: { returnUrl } });
}

export { homeFor };
