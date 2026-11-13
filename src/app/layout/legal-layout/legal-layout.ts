import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { APP_CONFIG } from '@core/api/api-config';
import { AuthStore } from '@core/auth/auth-store';
import { BrandLogo } from '@shared/ui/brand-logo';

/**
 * Páginas públicas de texto (privacidad y seguridad), con o sin sesión: papel, el logo arriba, el texto a una columna
 * de lectura y los enlaces entre ellas al pie.
 */
@Component({
  selector: 'app-legal-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BrandLogo],
  templateUrl: './legal-layout.html',
})
export class LegalLayout {
  protected readonly landingUrl = inject(APP_CONFIG).landingUrl;
  protected readonly home = inject(AuthStore).homeUrl;
  protected readonly year = new Date().getFullYear();
  protected readonly pages = [
    { link: '/privacidad', label: 'Privacidad' },
    { link: '/seguridad', label: 'Seguridad' },
  ] as const;
}
