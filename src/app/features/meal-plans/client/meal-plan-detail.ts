import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideCalendarDays,
  LucideCheck,
  LucideFlame,
  LucideLock,
} from '@lucide/angular';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { toProblem } from '../../../core/api/problem';
import { Toaster } from '../../../core/ui/toaster';
import {
  GOAL_LABELS,
  MEAL_CATEGORY_LABELS,
  TIER_LABELS,
  type Tier,
} from '../../../shared/i18n/labels';
import { LoadError } from '../../../shared/ui/load-error';
import { TierBadge } from '../../../shared/ui/tier-badge';
import { MealPlansApi } from '../data/meal-plans-api';
import { mealsByDay } from '../shared/meals-by-day';
import { titleFrom } from '../../../core/routing/title-strategy';

/** Un plan con sus comidas por día. Si es de pago y el cliente no tiene acceso, explica cómo conseguirlo. */
@Component({
  selector: 'app-meal-plan-detail',
  imports: [
    RouterLink,
    DecimalPipe,
    ButtonDirective,
    ButtonLabel,
    Skeleton,
    LucideArrowLeft,
    LucideCalendarDays,
    LucideFlame,
    LucideCheck,
    LucideLock,
    TierBadge,
    LoadError,
  ],
  templateUrl: './meal-plan-detail.html',
})
export class MealPlanDetail {
  private readonly api = inject(MealPlansApi);
  private readonly toaster = inject(Toaster);

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

  protected readonly problem = computed(() =>
    this.detail.error() ? toProblem(this.detail.error()) : null,
  );
  /** Nivel que pide el plan cuando la API responde 403 subscription-required. */
  protected readonly requiredTier = computed(() => {
    const problem = this.problem();
    return problem?.code === 'subscription-required'
      ? (problem.properties['requiredTier'] as Tier | undefined)
      : undefined;
  });
  protected readonly requiredTierLabel = computed(() => {
    const tier = this.requiredTier();
    return tier ? TIER_LABELS[tier] : '';
  });
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
  protected readonly saving = signal(false);

  protected async follow(): Promise<void> {
    this.saving.set(true);
    try {
      await this.api.enroll(this.id());
      this.enrollments.reload();
      this.toaster.success('Ya sigues este plan', 'Lo tienes a mano en «Los planes que sigues».');
    } catch {
      // El interceptor de errores ya ha avisado.
    } finally {
      this.saving.set(false);
    }
  }

  protected async unfollow(): Promise<void> {
    this.saving.set(true);
    try {
      await this.api.unenroll(this.id());
      this.enrollments.reload();
      this.toaster.info('Has dejado de seguir el plan');
    } catch {
      // El interceptor de errores ya ha avisado.
    } finally {
      this.saving.set(false);
    }
  }
}
