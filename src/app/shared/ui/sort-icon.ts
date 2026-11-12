import { Component, input } from '@angular/core';
import { LucideArrowDown, LucideArrowUp, LucideArrowUpDown } from '@lucide/angular';

/**
 * Icono de orden de una columna de p-table, con Lucide. Se usa en la plantilla `#sorticon` de la tabla, que recibe
 * el orden: 1 ascendente, -1 descendente, 0 sin ordenar. El estado lo anuncia `aria-sort` en la cabecera.
 */
@Component({
  selector: 'app-sort-icon',
  imports: [LucideArrowUp, LucideArrowDown, LucideArrowUpDown],
  host: { class: 'ml-1.5 inline-flex align-middle', 'aria-hidden': 'true' },
  template: `
    @switch (order()) {
      @case (1) {
        <svg lucideArrowUp class="size-4 text-brand-700"></svg>
      }
      @case (-1) {
        <svg lucideArrowDown class="size-4 text-brand-700"></svg>
      }
      @default {
        <svg lucideArrowUpDown class="size-4 text-muted"></svg>
      }
    }
  `,
})
export class SortIcon {
  readonly order = input<number | null | undefined>(0);
}
