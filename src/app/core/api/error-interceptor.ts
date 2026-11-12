import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Toaster } from '../ui/toaster';
import { SILENT_ERRORS } from './http-context';
import { toProblem } from './problem';

/**
 * Muestra un aviso cuando falla una operación (POST, PUT, DELETE...). Las lecturas no avisan: cada pantalla
 * enseña su propio estado de error con la opción de reintentar. Tampoco los 401 (los gestiona la sesión) ni
 * las peticiones marcadas con {@link SILENT_ERRORS}. El error sigue propagándose a quien hizo la petición.
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const toaster = inject(Toaster);
  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status !== 401 &&
        request.method !== 'GET' &&
        !request.context.get(SILENT_ERRORS)
      ) {
        toaster.problem(toProblem(error));
      }
      return throwError(() => error);
    }),
  );
};
