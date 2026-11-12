import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import {
  type ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { routes } from './app.routes';
import { APP_CONFIG, readAppConfig } from '@core/api/api-config';
import { errorInterceptor } from '@core/api/error-interceptor';
import { authInterceptor } from '@core/auth/auth-interceptor';
import { AuthStore } from '@core/auth/auth-store';
import { AppTitleStrategy } from '@core/routing/title-strategy';
import { provideUi } from '@core/theme/ui.config';

const config = readAppConfig();

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_CONFIG, useValue: config },
    // Sin zone.js: la vista se actualiza con signals y eventos de plantilla.
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      // Los parámetros de ruta y de la query llegan a los componentes como input().
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    // XHR y no Fetch (el backend por defecto): FetchBackend no informa del avance de las subidas.
    // El interceptor de errores va fuera: ve el resultado final, después de que la sesión reintente tras un 401.
    provideHttpClient(withXhr(), withInterceptors([errorInterceptor, authInterceptor])),
    // Al recargar, el access token en memoria se pierde: se recupera con la cookie antes de la primera navegación.
    provideAppInitializer(() => inject(AuthStore).refresh()),
    provideUi(config.primengLicenseKey),
    MessageService,
    ConfirmationService,
  ],
};
