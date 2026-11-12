import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';

/** Enlace «← Sección» encima del título de una página de detalle. */
@Component({
  selector: 'app-back-link',
  imports: [RouterLink, LucideArrowLeft],
  host: { class: 'mb-6 block' },
  template: `
    <a
      [routerLink]="link()"
      class="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
    >
      <svg lucideArrowLeft class="size-4"></svg>
      {{ label() }}
    </a>
  `,
})
export class BackLink {
  /** Destino (relativo a la ruta actual, como `routerLink`). */
  readonly link = input.required<string>();
  readonly label = input.required<string>();
}
