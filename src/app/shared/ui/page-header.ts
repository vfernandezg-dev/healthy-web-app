import { Component, input } from '@angular/core';

/**
 * Cabecera de una página: antetítulo opcional (la fecha en los inicios, la sección en los detalles), título (h1 en
 * la serif de la marca), descripción y acciones (proyectadas a la derecha). Un filete la separa del contenido.
 */
@Component({
  selector: 'app-page-header',
  host: {
    class:
      'mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between',
  },
  template: `
    <div class="min-w-0">
      @if (eyebrow()) {
        <p class="mb-2 text-xs font-semibold tracking-[0.08em] text-muted uppercase">
          {{ eyebrow() }}
        </p>
      }
      <h1 class="text-3xl sm:text-4xl">{{ title() }}</h1>
      @if (description()) {
        <p class="mt-2 max-w-2xl text-muted">{{ description() }}</p>
      }
    </div>
    <div class="flex shrink-0 flex-wrap gap-2">
      <ng-content />
    </div>
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly eyebrow = input<string>();
}
