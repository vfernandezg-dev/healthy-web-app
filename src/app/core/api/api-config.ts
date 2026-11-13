import { InjectionToken } from '@angular/core';

/** Configuración pública del web-app, resuelta en tiempo de compilación desde .env (ver .env.example). */
export interface AppConfig {
  /** URL base de la API, sin barra final. Relativa (/api/v1) o absoluta (https://api.example.com/api/v1). */
  readonly apiUrl: string;
  /**
   * Clave de la licencia Community de PrimeNG. Va dentro del bundle (no es un secreto, es un id de licencia);
   * sin ella, PrimeNG muestra un aviso. El build de release la exige (pnpm build:release).
   */
  readonly primengLicenseKey: string | undefined;
  /** Web pública (la landing), para el enlace «Volver a la web». */
  readonly landingUrl: string;
}

const DEFAULT_API_URL = '/api/v1';
const DEFAULT_LANDING_URL = 'https://healthybites.vfernandezg.dev';

export function normalizeBaseUrl(value: string | undefined, fallback: string): string {
  const candidate = value?.trim() || fallback;
  return candidate.replace(/\/+$/, '');
}

/**
 * Las variables NG_APP_ del build. @ngx-env/builder solo sustituye la expresión completa `import.meta.env?.NG_APP_*`
 * (el objeto `import.meta.env` no existe en el navegador), así que cada variable se nombra aquí, sin alias.
 * Comprobado tras el build de release por scripts/check-build-env.mjs.
 */
function environment(): Partial<Env> {
  return {
    NG_APP_API_URL: import.meta.env?.NG_APP_API_URL,
    NG_APP_PRIMENG_LICENSE_KEY: import.meta.env?.NG_APP_PRIMENG_LICENSE_KEY,
    NG_APP_LANDING_URL: import.meta.env?.NG_APP_LANDING_URL,
  };
}

export function readAppConfig(env: Partial<Env> = environment()): AppConfig {
  return {
    apiUrl: normalizeBaseUrl(env.NG_APP_API_URL, DEFAULT_API_URL),
    primengLicenseKey: env.NG_APP_PRIMENG_LICENSE_KEY?.trim() || undefined,
    landingUrl: normalizeBaseUrl(env.NG_APP_LANDING_URL, DEFAULT_LANDING_URL),
  };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => readAppConfig(),
});
