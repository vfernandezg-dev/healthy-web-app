import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideHouse } from '@lucide/angular';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { BrandLogo } from '../../shared/ui/brand-logo';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ButtonDirective, ButtonIcon, ButtonLabel, LucideHouse, BrandLogo],
  template: `
    <main class="grid min-h-dvh place-items-center px-6 py-16">
      <div class="card w-full max-w-lg px-8 py-12 text-center sm:px-12">
        <app-brand-logo [priority]="true" class="mb-10" />
        <p class="text-sm font-semibold tracking-wide text-brand-700 uppercase">Error 404</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-balance">Esta página no existe</h1>
        <p class="mt-3 text-muted">
          Puede que el enlace esté mal escrito o que la página se haya movido.
        </p>
        <a pButton routerLink="/" class="mt-8">
          <svg lucideHouse pButtonIcon></svg>
          <span pButtonLabel>Volver al inicio</span>
        </a>
      </div>
    </main>
  `,
})
export class NotFound {}
