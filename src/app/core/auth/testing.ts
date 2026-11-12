import type { Provider } from '@angular/core';
import { APP_CONFIG, type AppConfig } from '../api/api-config';
import type { SessionResponse } from '../api/schema';
import type { Role } from './roles';

/** Configuración de la app para los tests unitarios. */
export const TEST_CONFIG: AppConfig = {
  apiUrl: '/api/v1',
  primengLicenseKey: undefined,
  landingUrl: 'https://healthybites.example',
};

export function provideTestConfig(): Provider {
  return { provide: APP_CONFIG, useValue: TEST_CONFIG };
}

/** Una sesión de la API para los tests. */
export function session(role: Role = 'CLIENT', accessToken = 'token-1'): SessionResponse {
  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: 900,
    user: {
      id: '00000000-0000-7000-8000-000000000005',
      email: 'maria.lopez@healthybites.com',
      firstName: 'María',
      lastName: 'López',
      role,
    },
  };
}
