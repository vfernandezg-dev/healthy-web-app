import { HttpErrorResponse, type HttpInterceptorFn, type HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { APP_CONFIG } from '../api/api-config';
import { AuthStore } from './auth-store';

/** Rutas públicas o de sesión: no llevan access token ni disparan un refresh si responden 401. */
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/invitations/',
];

/**
 * Añade el access token a las peticiones a la API, y solo a la API: nunca a otros orígenes. Si una petición
 * responde 401 porque el token caducó, renueva la sesión una vez y la repite; si no se puede renovar, manda al
 * usuario al login.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const { apiUrl } = inject(APP_CONFIG);
  if (!request.url.startsWith(`${apiUrl}/`)) {
    return next(request);
  }
  const path = request.url.slice(apiUrl.length);
  if (PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath))) {
    return next(request);
  }

  const auth = inject(AuthStore);
  return next(withToken(request, auth.accessToken())).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }
      return from(auth.refresh()).pipe(
        switchMap((refreshed) => {
          if (!refreshed) {
            auth.expire();
            return throwError(() => error);
          }
          return next(withToken(request, auth.accessToken()));
        }),
      );
    }),
  );
};

function withToken(request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
}
