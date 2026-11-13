import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCalendarDays, LucideFlame } from '@lucide/angular';
import type { MealPlanSummaryResponse } from '@core/api/schema';
import { GOAL_LABELS } from '@shared/i18n/labels';
import { TierBadge } from '@shared/ui/tier-badge';

/** Tarjeta de un plan en un listado; toda la tarjeta enlaza al detalle. */
@Component({
  selector: 'app-plan-card',
  imports: [RouterLink, DecimalPipe, LucideCalendarDays, LucideFlame, TierBadge],
  host: { class: 'block h-full' },
  template: `
    <a
      [routerLink]="link()"
      class="card group flex h-full flex-col p-6 transition-[border-color,translate] duration-200 hover:border-line-strong motion-safe:hover:-translate-y-0.5"
    >
      <div class="flex flex-wrap items-center gap-2">
        <span class="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
          {{ goals[plan().goal] }}
        </span>
        <app-tier-badge [tier]="plan().requiredTier" [locked]="plan().locked" />
        <ng-content />
      </div>
      <h3 class="mt-3 text-lg font-bold text-balance group-hover:text-brand-800">
        {{ plan().title }}
      </h3>
      @if (plan().author; as author) {
        <p class="text-sm text-muted">De {{ author.name }}</p>
      }
      <p class="mt-3 line-clamp-3 flex-1 text-muted">{{ plan().description }}</p>
      <p class="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-ink">
        <span class="inline-flex items-center gap-1.5">
          <svg lucideCalendarDays class="size-4 text-brand-700"></svg>
          {{ plan().durationDays }} días
        </span>
        @if (plan().averageDailyCalories > 0) {
          <span class="inline-flex items-center gap-1.5">
            <svg lucideFlame class="size-4 text-brand-700"></svg>
            {{ plan().averageDailyCalories | number }} kcal/día
          </span>
        }
      </p>
    </a>
  `,
})
export class PlanCard {
  readonly plan = input.required<MealPlanSummaryResponse>();
  readonly link = input.required<string>();

  protected readonly goals = GOAL_LABELS;
}
