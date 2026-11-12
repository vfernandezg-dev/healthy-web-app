import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { type EnvironmentProviders, LOCALE_ID, makeEnvironmentProviders } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import { HealthyBitesPreset } from './healthy-bites.preset';
import { PRIMENG_ES } from './primeng-es';

registerLocaleData(localeEs);

/**
 * Interfaz de usuario: PrimeNG con el preset de la marca y textos en español, y formato de fechas y números en
 * español (DatePipe, DecimalPipe...). La configuración de Signal Forms va en los layouts (shared/forms/forms.config.ts)
 * para no cargar los formularios en el bundle inicial.
 *
 * Los iconos Lucide no se configuran aquí a propósito: importar cualquier cosa de @lucide/angular en el código
 * inicial arrastraría al bundle inicial todos los iconos usados en la app. Su tamaño se fija por CSS (styles.css).
 *
 * @param primengLicenseKey clave de la licencia Community de PrimeNG (NG_APP_PRIMENG_LICENSE_KEY). Sin ella,
 *   PrimeNG funciona igual pero muestra un aviso de licencia.
 */
export function provideUi(primengLicenseKey: string | undefined): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: LOCALE_ID, useValue: 'es' },
    providePrimeNG({
      theme: {
        preset: HealthyBitesPreset,
        options: {
          prefix: 'p',
          darkModeSelector: '.app-dark',
          cssLayer: { name: 'primeng', order: 'theme, base, primeng, components, utilities' },
        },
      },
      ripple: false,
      translation: PRIMENG_ES,
      ...(primengLicenseKey ? { license: primengLicenseKey } : {}),
    }),
  ]);
}
