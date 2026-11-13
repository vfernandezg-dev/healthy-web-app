import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { APP_CONFIG } from '@core/api/api-config';
import { SIGNAL_FORMS_PROVIDERS } from '@shared/forms/forms.config';
import { BrandLogo } from '@shared/ui/brand-logo';

/**
 * Pantallas de acceso: en escritorio, el panel de la marca en verde pino (con una foto) y el formulario sobre el
 * papel; en móvil, una franja de marca encima del formulario. La foto es decorativa (alt vacío) y no se descarga en
 * móvil: su panel no se muestra y la carga es diferida.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, NgOptimizedImage, BrandLogo],
  providers: [SIGNAL_FORMS_PROVIDERS],
  templateUrl: './auth-layout.html',
})
export class AuthLayout {
  protected readonly landingUrl = inject(APP_CONFIG).landingUrl;
  protected readonly year = new Date().getFullYear();
}
