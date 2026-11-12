import { HttpErrorResponse } from '@angular/common/http';

/** Un campo inválido según la API (Bean Validation), con el mensaje en español. */
export interface FieldProblem {
  /** Ruta del campo en el cuerpo enviado, por ejemplo `email` o `profile.heightCm`. */
  readonly field: string;
  readonly message: string;
}

/**
 * Error de la API en formato RFC 9457 (ProblemDetail). `code` es estable (ver el ADR 0006 de la API) y es lo que
 * interpreta la app; `detail` es un mensaje en español listo para mostrar.
 */
export interface Problem {
  readonly status: number;
  readonly code: string;
  /** Resumen corto en español según el tipo de error (para el título de un aviso). */
  readonly summary: string;
  readonly detail: string;
  readonly errors: readonly FieldProblem[];
  /** Datos extra del error, como `requiredTier` en `403 subscription-required`. */
  readonly properties: Readonly<Record<string, unknown>>;
}

const SUMMARIES: Readonly<Record<number, string>> = {
  0: 'Sin conexión',
  400: 'Petición no válida',
  401: 'Sesión caducada',
  403: 'Sin acceso',
  404: 'No encontrado',
  409: 'No se ha podido completar',
  413: 'Fichero demasiado grande',
  415: 'Tipo de fichero no admitido',
  422: 'Revisa los datos',
  429: 'Demasiados intentos',
};

const DETAILS: Readonly<Record<number, string>> = {
  0: 'No hay conexión con el servidor. Comprueba tu conexión e inténtalo de nuevo.',
  401: 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
  403: 'No tienes acceso a esto.',
  404: 'Lo que buscas no existe o ya no está disponible.',
  429: 'Has hecho demasiados intentos. Espera un momento y vuelve a probar.',
};

const UNEXPECTED = 'Algo ha fallado. Inténtalo de nuevo en unos minutos.';

/** Convierte cualquier error de una petición en un {@link Problem}. Nunca lanza. */
export function toProblem(error: unknown): Problem {
  if (!(error instanceof HttpErrorResponse)) {
    return problem(-1, 'unexpected', 'Error inesperado', UNEXPECTED);
  }
  const status = error.status;
  const body = isRecord(error.error) ? error.error : {};
  // Lo que no es estándar de RFC 9457 son datos extra del error (por ejemplo, requiredTier).
  const { code, detail, errors, title, type, instance, status: _status, ...extra } = body;
  return {
    status,
    code:
      typeof code === 'string' && code ? code : status === 0 ? 'network-error' : `http-${status}`,
    summary:
      SUMMARIES[status] ?? (status >= 500 ? 'Error del servidor' : 'No se ha podido completar'),
    detail: typeof detail === 'string' && detail ? detail : (DETAILS[status] ?? UNEXPECTED),
    errors: Array.isArray(errors) ? errors.filter(isFieldProblem) : [],
    properties: extra,
  };
}

function problem(status: number, code: string, summary: string, detail: string): Problem {
  return { status, code, summary, detail, errors: [], properties: {} };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFieldProblem(value: unknown): value is FieldProblem {
  return (
    isRecord(value) && typeof value['field'] === 'string' && typeof value['message'] === 'string'
  );
}
