import { Component, input } from '@angular/core';

/** Cabecera de una página: título (h1), descripción y acciones (proyectadas a la derecha). */
@Component({
  selector: 'app-page-header',
  host: { class: 'mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between' },
  template: `
    <div class="min-w-0">
      @if (eyebrow()) {
        <p class="text-sm font-semibold tracking-wide text-brand-700 uppercase">{{ eyebrow() }}</p>
      }
      <h1 class="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{{ title() }}</h1>
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
