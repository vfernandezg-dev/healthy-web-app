import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { AuthService } from '../services/auth.service';

/** Endpoints públicos o de sesión: no llevan access token ni disparan un refresh si responden 401. */
const PUBLIC_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/register/', '/auth/forgot-password',
  '/auth/reset-password', '/mail/'];

/**
 * Añade el access token a las peticiones a la API (y solo a la API: nunca a otros orígenes). Si una petición
 * responde 401 porque el token caducó, renueva la sesión una vez y la reintenta; si no se puede renovar, manda
 * al usuario al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const { apiUrl } = inject(APP_CONFIG);

  if (!req.url.startsWith(apiUrl)) {
    return next(req);
  }
  const path = req.url.slice(apiUrl.length);
  if (PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath))) {
    return next(req);
  }

  return next(withToken(req, auth.accessToken())).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }
      return from(auth.refresh()).pipe(
        switchMap(refreshed => {
          if (!refreshed) {
            auth.expireSession();
            return throwError(() => error);
          }
          return next(withToken(req, auth.accessToken()));
        }),
      );
    }),
  );
};

function withToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
}
