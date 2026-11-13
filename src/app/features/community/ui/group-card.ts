import { I18nPluralPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideUsers } from '@lucide/angular';
import type { GroupResponse } from '@core/api/schema';
import { MEMBERS_PLURAL, membershipLabel } from '../data/membership';
import { VisibilityBadge } from './visibility-badge';
import { Badge } from '@shared/ui/badge';

/** Tarjeta de un grupo del directorio. */
@Component({
  selector: 'app-group-card',
  imports: [Badge, RouterLink, I18nPluralPipe, LucideUsers, VisibilityBadge],
  host: { class: 'block h-full' },
  template: `
    <a
      [routerLink]="['groups', group().id]"
      class="card group flex h-full flex-col p-6 transition-[border-color,translate] duration-200 hover:border-line-strong motion-safe:hover:-translate-y-0.5"
    >
      <div class="flex flex-wrap items-center gap-2">
        <app-visibility-badge [visibility]="group().visibility" />
        @if (membership(); as label) {
          <app-badge tone="positive">{{ label }}</app-badge>
        }
      </div>
      <h3 class="mt-3 text-lg font-bold text-balance group-hover:text-brand-800">
        {{ group().name }}
      </h3>
      <p class="mt-2 line-clamp-3 flex-1 text-muted">
        {{ group().description || 'Sin descripción.' }}
      </p>
      <p class="mt-4 flex items-center gap-2 text-sm font-medium text-muted">
        <svg lucideUsers class="size-4"></svg>
        {{ group().members | i18nPlural: membersPlural }}
      </p>
    </a>
  `,
})
export class GroupCard {
  readonly group = input.required<GroupResponse>();

  protected readonly membership = computed(() => membershipLabel(this.group().membership));
  protected readonly membersPlural = MEMBERS_PLURAL;
}
