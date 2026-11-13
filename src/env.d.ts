// Variables de entorno de compilación (@ngx-env/builder): solo las que empiezan por NG_APP_.
// Se leen de .env (ver .env.example) o del entorno del proceso de build. Nunca contienen secretos:
// todo lo que entra aquí acaba en el bundle que descarga el navegador.
declare interface Env {
  readonly NODE_ENV: string;
  /** URL base de la API. Relativa (/api/v1) cuando app y API comparten origen o en desarrollo con el proxy. */
  readonly NG_APP_API_URL?: string | undefined;
  /** Clave de la licencia Community de PrimeNG (id de licencia, no secreto). */
  readonly NG_APP_PRIMENG_LICENSE_KEY?: string | undefined;
  /** Web pública de Healthy Bites (la landing). */
  readonly NG_APP_LANDING_URL?: string | undefined;
}

/**
 * `import.meta.env` no existe en ejecución: @ngx-env/builder sustituye al compilar cada expresión completa
 * `import.meta.env?.NG_APP_*` por su valor. Las que no se definieron en el build (y todas en los tests) quedan
 * undefined, por eso es opcional.
 */
declare interface ImportMeta {
  readonly env?: Env;
}
