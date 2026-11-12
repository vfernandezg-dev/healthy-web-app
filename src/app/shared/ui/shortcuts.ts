import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideDynamicIcon } from '@lucide/angular';
import type { NavItem } from '@core/routing/navigation';

/** Accesos directos a las secciones de un rol (las del menú que tienen descripción). */
@Component({
  selector: 'app-shortcuts',
  imports: [RouterLink, LucideDynamicIcon, LucideArrowRight],
  host: { class: 'block' },
  template: `
    <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="list">
      @for (item of items(); track item.link) {
        <li>
          <a
            [routerLink]="item.link"
            class="card group flex h-full items-start gap-4 p-5 transition-shadow hover:shadow-card-hover"
          >
            <span
              class="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700"
            >
              <svg [lucideIcon]="item.icon"></svg>
            </span>
            <span class="min-w-0">
              <span class="flex items-center gap-2 font-bold">
                {{ item.label }}
                <svg
                  lucideArrowRight
                  class="size-4 text-brand-700 transition-transform group-hover:translate-x-1"
                ></svg>
              </span>
              <span class="mt-1 block text-sm text-muted">{{ item.description }}</span>
            </span>
          </a>
        </li>
      }
    </ul>
  `,
})
export class Shortcuts {
  readonly items = input.required<readonly NavItem[]>();
}
