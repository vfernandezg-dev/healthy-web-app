import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';

/**
 * Cabecera de una sección o de una tarjeta: el h2 (con el id al que apunta el aria-labelledby de la sección) y, a la
 * derecha, el enlace para ver más. `size="section"` para las secciones de página; por defecto, tamaño de tarjeta.
 */
@Component({
  selector: 'app-section-header',
  imports: [RouterLink, LucideArrowRight],
  host: { class: 'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1' },
  template: `
    <h2
      [id]="headingId()"
      class="font-semibold"
      [class.text-lg]="size() === 'section'"
      [class.text-base]="size() === 'card'"
    >
      {{ heading() }}
    </h2>
    @if (link(); as link) {
      <a
        [routerLink]="link"
        class="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
      >
        {{ linkLabel() }}
        <svg lucideArrowRight class="size-4"></svg>
      </a>
    }
  `,
})
export class SectionHeader {
  readonly headingId = input.required<string>();
  readonly heading = input.required<string>();
  /** Ruta del enlace (relativa a la página). Sin ella no hay enlace. */
  readonly link = input<string>();
  readonly linkLabel = input('Ver más');
  readonly size = input<'card' | 'section'>('card');
}
