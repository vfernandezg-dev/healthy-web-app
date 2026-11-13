import { Component, input } from '@angular/core';
import { LucideDynamicIcon, type LucideIcon, LucideInbox } from '@lucide/angular';

/**
 * Lista vacía: un recuadro discontinuo y discreto con el icono, el título, la explicación y, proyectada, la acción
 * para empezar. Alineado a la izquierda, como el contenido que sustituye.
 */
@Component({
  selector: 'app-empty-state',
  imports: [LucideDynamicIcon],
  host: { class: 'block motion-safe:animate-rise' },
  template: `
    <div
      class="flex items-start gap-4 rounded-card border border-dashed border-line-strong px-5 py-6"
    >
      <svg [lucideIcon]="icon()" class="mt-0.5 text-muted"></svg>
      <div class="min-w-0">
        <p class="font-semibold">{{ title() }}</p>
        @if (description()) {
          <p class="mt-1 max-w-prose text-sm text-muted">{{ description() }}</p>
        }
        <div class="mt-4 flex flex-wrap gap-2 empty:hidden">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly icon = input<LucideIcon>(LucideInbox);
}
