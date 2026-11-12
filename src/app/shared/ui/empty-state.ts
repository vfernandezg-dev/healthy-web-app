import { Component, input } from '@angular/core';
import { LucideDynamicIcon, type LucideIcon, LucideInbox } from '@lucide/angular';

/** Lista vacía: icono, título, explicación y, proyectada, la acción para empezar. */
@Component({
  selector: 'app-empty-state',
  imports: [LucideDynamicIcon],
  host: { class: 'block' },
  template: `
    <div
      class="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-brand-200 bg-white/60 px-6 py-12 text-center"
    >
      <span class="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-700">
        <svg [lucideIcon]="icon()" class="size-6"></svg>
      </span>
      <p class="text-lg font-bold">{{ title() }}</p>
      @if (description()) {
        <p class="max-w-md text-muted">{{ description() }}</p>
      }
      <div class="mt-2 flex flex-wrap justify-center gap-2">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly icon = input<LucideIcon>(LucideInbox);
}
