import { Component, computed, input } from '@angular/core';

/**
 * Barra de progreso accesible (role="progressbar" con su valor y su nombre). Sustituye a p-progressbar, que en
 * PrimeNG 22 pone en su host atributos ARIA que axe marca como no válidos.
 */
@Component({
  selector: 'app-progress-bar',
  host: {
    class: 'block h-2.5 overflow-hidden rounded-full bg-brand-100',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'clamped()',
    '[attr.aria-label]': 'label() ?? null',
    '[attr.aria-labelledby]': 'labelledBy() ?? null',
  },
  template: `
    <div
      class="h-full rounded-full bg-brand-700 transition-[width] duration-300 ease-out"
      [style.width.%]="clamped()"
    ></div>
  `,
})
export class ProgressBar {
  /** De 0 a 100. */
  readonly value = input.required<number>();
  readonly label = input<string>();
  readonly labelledBy = input<string>();

  protected readonly clamped = computed(() => Math.max(0, Math.min(100, Math.round(this.value()))));
}
