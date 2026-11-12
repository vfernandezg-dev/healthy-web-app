import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { LucideCalendarDays, LucideCheck, LucideFlame } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { GOAL_LABELS, MEAL_CATEGORY_LABELS } from '@shared/i18n/labels';
import { LoadError } from '@shared/ui/load-error';
import { TierBadge } from '@shared/ui/tier-badge';
import { MealPlansApi } from '../data/meal-plans-api';
import { mealsByDay } from '../data/meals-by-day';
import { titleFrom } from '@core/routing/title-strategy';
import { mutation } from '@shared/utils/mutation';
import { Paywall, requiredTierOf } from '@shared/ui/paywall';
import { BackLink } from '@shared/ui/back-link';

/** Un plan con sus comidas por día. Si es de pago y el cliente no tiene acceso, explica cómo conseguirlo. */
@Component({
  selector: 'app-meal-plan-detail',
  imports: [
    BackLink,
    Paywall,
    DecimalPipe,
    ButtonDirective,
    Skeleton,
    LucideCalendarDays,
    LucideFlame,
    LucideCheck,
    TierBadge,
    LoadError,
  ],
  templateUrl: './meal-plan-detail.html',
})
export class MealPlanDetail {
  private readonly api = inject(MealPlansApi);

  /** Id del plan (parámetro de la ruta). */
  readonly id = input.required<string>();

  protected readonly detail = this.api.detail(this.id);

  /** La pestaña lleva el nombre de lo que se ve. */
  private readonly tabTitle = titleFrom(() =>
    this.detail.hasValue() ? this.detail.value().plan.title : null,
  );
  private readonly enrollments = this.api.enrollments();

  protected readonly goals = GOAL_LABELS;
  protected readonly categories = MEAL_CATEGORY_LABELS;

  /** Nivel que pide cuando la API responde 403 subscription-required (bloqueado para el cliente). */
  protected readonly requiredTier = computed(() => requiredTierOf(this.detail.error()));
  protected readonly days = computed(() => {
    if (!this.detail.hasValue()) {
      return [];
    }
    const { meals, plan } = this.detail.value();
    return mealsByDay(meals, plan.durationDays);
  });
  protected readonly enrolled = computed(
    () =>
      this.enrollments.hasValue() &&
      this.enrollments.value().some((enrollment) => enrollment.plan.id === this.id()),
  );
  protected readonly follow = mutation(() => this.api.enroll(this.id()), {
    success: {
      summary: 'Ya sigues este plan',
      detail: 'Lo tienes a mano en «Los planes que sigues».',
    },
    onSuccess: () => this.enrollments.reload(),
  });

  protected readonly unfollow = mutation(() => this.api.unenroll(this.id()), {
    success: { summary: 'Has dejado de seguir el plan', severity: 'info' },
    onSuccess: () => this.enrollments.reload(),
  });
}
