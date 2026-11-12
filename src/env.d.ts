// Variables de entorno de compilación (@ngx-env/builder): solo las que empiezan por NG_APP_.
// Se leen de .env (ver .env.example) o del entorno del proceso de build. Nunca contienen secretos:
// todo lo que entra aquí acaba en el bundle que descarga el navegador.
declare interface Env {
  readonly NODE_ENV: string;
  /** URL base de la API. Relativa (/api/v1) cuando app y API comparten origen o en desarrollo con el proxy. */
  readonly NG_APP_API_URL?: string;
  /** Clave de la licencia Community de PrimeNG (id de licencia, no secreto). */
  readonly NG_APP_PRIMENG_LICENSE_KEY?: string;
}

declare interface ImportMeta {
  readonly env: Env;
}
