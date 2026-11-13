import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideHouse } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { BrandLogo } from '@shared/ui/brand-logo';
import { StatusPanel } from '@shared/ui/status-panel';

/** Ruta desconocida (con o sin sesión): una página de papel con el logo y el camino de vuelta. */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ButtonDirective, LucideHouse, BrandLogo, StatusPanel],
  template: `
    <div class="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-8 sm:px-10">
      <a routerLink="/" class="w-fit rounded-md"><app-brand-logo /></a>
      <main class="flex flex-1 items-center py-16">
        <app-status-panel eyebrow="Error 404" heading="Esta página no existe" [framed]="false">
          <p>Puede que el enlace esté mal escrito o que la página se haya movido.</p>
          <a actions pButton routerLink="/">
            <svg lucideHouse></svg>
            Volver al inicio
          </a>
        </app-status-panel>
      </main>
    </div>
  `,
})
export class NotFound {}
