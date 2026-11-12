import { HttpErrorResponse, type HttpInterceptorFn, type HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { APP_CONFIG } from '../api/api-config';
import { AuthStore, type RefreshOutcome } from './auth-store';

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
 * responde 401 porque el token caducó, renueva la sesión una vez y la repite:
 * - Si otra petición ya lo renovó mientras esta iba y volvía, se repite con el token nuevo sin otro refresh (cada
 *   refresh rota el token del servidor).
 * - Si la API rechaza la renovación, o el reintento vuelve a dar 401, la sesión ha caducado: al login.
 * - Si no se puede renovar por la red o por un error del servidor, se devuelve el error y la sesión sigue.
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
  const sent = auth.accessToken();
  return next(withToken(request, sent)).pipe(
    catchError((error: unknown) => {
      if (!isUnauthorized(error)) {
        return throwError(() => error);
      }
      const renewal: Promise<RefreshOutcome> =
        auth.accessToken() !== sent && auth.accessToken() !== null
          ? Promise.resolve('renewed')
          : auth.refresh();
      return from(renewal).pipe(
        switchMap((outcome) => {
          if (outcome === 'expired') {
            auth.expire();
            return throwError(() => error);
          }
          if (outcome === 'unavailable') {
            return throwError(() => error);
          }
          return next(withToken(request, auth.accessToken())).pipe(
            catchError((retryError: unknown) => {
              if (isUnauthorized(retryError)) {
                auth.expire();
              }
              return throwError(() => retryError);
            }),
          );
        }),
      );
    }),
  );
};

function isUnauthorized(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 401;
}

function withToken(request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
}
