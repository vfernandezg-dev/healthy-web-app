import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideFlame, LucideSalad, LucideTarget } from '@lucide/angular';
import { APP_CONFIG } from '@core/api/api-config';
import { SIGNAL_FORMS_PROVIDERS } from '@shared/forms/forms.config';
import { BrandLogo } from '@shared/ui/brand-logo';

/** Pantallas de acceso: la marca a un lado (en escritorio) y el formulario al otro. */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, BrandLogo, LucideSalad, LucideTarget, LucideFlame],
  providers: [SIGNAL_FORMS_PROVIDERS],
  templateUrl: './auth-layout.html',
})
export class AuthLayout {
  protected readonly landingUrl = inject(APP_CONFIG).landingUrl;
  protected readonly year = new Date().getFullYear();
}
