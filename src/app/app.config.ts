import { provideHttpClient, withFetch } from '@angular/common/http';
import { type ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { APP_CONFIG, readAppConfig } from './core/api/api-config';
import { provideUi } from './core/theme/ui.config';

const config = readAppConfig();

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_CONFIG, useValue: config },
    // Sin zone.js: la vista se actualiza con signals y eventos de plantilla.
    provideZonelessChangeDetection(),
    // Los parámetros de ruta llegan a los componentes como input().
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    provideUi(config.primengLicenseKey),
  ],
};
