import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';

/**
 * Una cifra destacada (KPI): la etiqueta, la cifra en grande, un detalle opcional y, si se indica, el enlace a su
 * sección. Va dentro de un `.stat-ledger`, que las une en una sola pieza separada por filetes.
 */
@Component({
  selector: 'app-stat-card',
  imports: [RouterLink, LucideArrowRight],
  host: { class: 'flex h-full flex-col bg-card p-5 sm:p-6' },
  template: `
    <p class="text-sm font-medium text-muted">{{ label() }}</p>
    <p class="figure mt-2 text-3xl sm:text-4xl">{{ value() }}</p>
    @if (detail()) {
      <p class="mt-1 text-sm text-muted">{{ detail() }}</p>
    }
    @if (link(); as link) {
      <a
        [routerLink]="link"
        class="group mt-auto inline-flex w-fit items-center gap-1 pt-4 text-sm font-semibold text-brand-700 hover:underline"
      >
        {{ linkLabel() }}
        <svg lucideArrowRight class="size-4 transition-transform group-hover:translate-x-0.5"></svg>
      </a>
    }
  `,
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly detail = input<string | null>();
  /** Ruta de la sección (relativa a la página). Sin ella no hay enlace. */
  readonly link = input<string>();
  readonly linkLabel = input('Ver más');
}
