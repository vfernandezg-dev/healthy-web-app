import { Component, computed, input } from '@angular/core';
import { LucideBookOpen, LucideDynamicIcon, LucideFlame, LucideUtensils } from '@lucide/angular';
import type { RewardResponse } from '@core/api/schema';

/** Icono del premio: un plan o un contenido. */
export function prizeIcon(reward: RewardResponse) {
  return reward.target.type === 'MEAL_PLAN' ? LucideUtensils : LucideBookOpen;
}

/**
 * Tarjeta de una recompensa: los días de racha que pide, el título, la descripción y el premio. Presentacional: la
 * página proyecta su estado (atributo `badge`) y sus acciones (el resto del contenido).
 */
@Component({
  selector: 'app-reward-card',
  imports: [LucideFlame, LucideDynamicIcon],
  host: { class: 'card flex h-full flex-col p-6' },
  template: `
    <div class="flex items-center justify-between gap-2">
      <span
        class="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900"
      >
        <svg lucideFlame class="size-3.5"></svg> {{ reward().requiredStreakDays }} días seguidos
      </span>
      <ng-content select="[badge]" />
    </div>
    @if (headingLevel() === 2) {
      <h2 class="mt-3 text-lg font-bold">{{ reward().title }}</h2>
    } @else {
      <h3 class="mt-3 text-lg font-bold">{{ reward().title }}</h3>
    }
    <p class="mt-2 flex-1 text-muted">{{ reward().description }}</p>
    <p class="mt-4 flex items-center gap-2 text-sm font-medium">
      <svg [lucideIcon]="prizeIcon()" class="size-4 text-brand-700"></svg>
      {{ reward().target.title }}
    </p>
    <ng-content />
  `,
})
export class RewardCard {
  readonly reward = input.required<RewardResponse>();
  /** Nivel del título: 2 si la página no tiene otro encabezado por encima de la lista, 3 si lo tiene. */
  readonly headingLevel = input<2 | 3>(3);

  protected readonly prizeIcon = computed(() => prizeIcon(this.reward()));
}
