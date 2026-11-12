import { InjectionToken } from '@angular/core';

/** Configuración pública del web-app, resuelta en tiempo de compilación desde .env (ver .env.example). */
export interface AppConfig {
  /** URL base de la API, sin barra final. Relativa (/api/v1) o absoluta (https://api.example.com/api/v1). */
  readonly apiUrl: string;
}

const DEFAULT_API_URL = '/api/v1';

export function normalizeBaseUrl(value: string | undefined, fallback: string): string {
  const candidate = value?.trim() || fallback;
  return candidate.replace(/\/+$/, '');
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    // @ngx-env/builder sustituye import.meta.env al compilar; en los tests (builder oficial) no existe.
    apiUrl: normalizeBaseUrl(import.meta.env?.NG_APP_API_URL, DEFAULT_API_URL),
  }),
});
