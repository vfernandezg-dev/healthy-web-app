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

/** @ngx-env/builder sustituye import.meta.env al compilar; en los tests (builder oficial) no existe. */
function environment(): Partial<Env> {
  return import.meta.env ?? {};
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
