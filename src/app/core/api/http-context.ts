import { HttpContext, HttpContextToken } from '@angular/common/http';

/** Si es true, el interceptor de errores no muestra un aviso: la pantalla gestiona el error ella misma. */
export const SILENT_ERRORS = new HttpContextToken<boolean>(() => false);

/** Contexto para peticiones cuyos errores se muestran en la propia pantalla (por ejemplo, en un formulario). */
export function silentErrors(): HttpContext {
  return new HttpContext().set(SILENT_ERRORS, true);
}
