import { Component, input } from '@angular/core';
import { LucideDynamicIcon, type LucideIcon } from '@lucide/angular';

/** Una cifra destacada (KPI): etiqueta, valor y un detalle opcional. */
@Component({
  selector: 'app-stat-card',
  imports: [LucideDynamicIcon],
  host: { class: 'block h-full' },
  template: `
    <div class="card flex h-full items-start gap-4 p-5">
      @if (icon(); as icon) {
        <span
          class="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700"
          aria-hidden="true"
        >
          <svg [lucideIcon]="icon" class="size-5.5"></svg>
        </span>
      }
      <div class="min-w-0">
        <p class="text-sm font-medium text-muted">{{ label() }}</p>
        <p class="mt-1 text-2xl font-bold tracking-tight tabular-nums">{{ value() }}</p>
        @if (detail()) {
          <p class="mt-1 text-sm text-muted">{{ detail() }}</p>
        }
      </div>
    </div>
  `,
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly detail = input<string | null>();
  readonly icon = input<LucideIcon>();
}
