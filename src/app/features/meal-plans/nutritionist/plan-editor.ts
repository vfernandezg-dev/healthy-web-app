import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { LucidePencil, LucidePlus, LucideTrash } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import type { MealPlanDetailResponse, MealResponse } from '@core/api/schema';
import { Toaster } from '@core/ui/toaster';
import {
  MEAL_CATEGORY_LABELS,
  PUBLICATION_STATUS_LABELS,
  PUBLICATION_STATUS_TONE,
} from '@shared/i18n/labels';
import { LoadError } from '@shared/ui/load-error';
import { MealPlansApi } from '../data/meal-plans-api';
import { mealsByDay } from '../data/meals-by-day';
import { MealDialog, type MealTarget } from './meal-dialog';
import { PlanFields, emptyPlan, planModelOf, planSchema, toPlanRequest } from '../ui/plan-fields';
import { dialogState } from '@shared/ui/dialog-state';
import { formSubmitter } from '@shared/forms/form-submitter';
import { mutation } from '@shared/utils/mutation';
import { PublicationActions } from '@shared/publishing/publication-actions';
import { BackLink } from '@shared/ui/back-link';
import { Badge } from '@shared/ui/badge';

/** Editor de un plan del nutricionista: datos, comidas por día y publicación. */
@Component({
  selector: 'app-plan-editor',
  imports: [
    BackLink,
    PublicationActions,
    DecimalPipe,
    ButtonDirective,
    Skeleton,
    Badge,
    LucidePlus,
    LucidePencil,
    LucideTrash,
    PlanFields,
    MealDialog,
    LoadError,
  ],
  templateUrl: './plan-editor.html',
})
export class PlanEditor {
  private readonly submitForm = formSubmitter();
  private readonly api = inject(MealPlansApi);
  private readonly router = inject(Router);
  private readonly toaster = inject(Toaster);
  protected readonly mealDialog = dialogState<MealTarget>();

  /** Id del plan (parámetro de la ruta). */
  readonly id = input.required<string>();

  protected readonly detail = this.api.own(this.id);
  protected readonly current = computed<MealPlanDetailResponse | undefined>(() =>
    this.detail.hasValue() ? this.detail.value() : undefined,
  );
  protected readonly days = computed(() => {
    const current = this.current();
    return current ? mealsByDay(current.meals, current.plan.durationDays) : [];
  });
  protected readonly categories = MEAL_CATEGORY_LABELS;
  protected readonly statusLabels = PUBLICATION_STATUS_LABELS;
  protected readonly statusTones = PUBLICATION_STATUS_TONE;

  protected readonly model = linkedSignal(() => {
    const current = this.current();
    return current ? planModelOf(current) : emptyPlan();
  });
  protected readonly planForm = form(this.model, planSchema);

  protected savePlan(event: Event): Promise<void> {
    return this.submitForm(event, this.planForm, {
      save: () => this.api.update(this.id(), toPlanRequest(this.model())),
      onSuccess: (plan) => {
        this.detail.value.set(plan);
        this.planForm().reset();
        this.toaster.success('Plan guardado');
      },
    });
  }

  protected mealSaved(): void {
    this.detail.reload();
    this.toaster.success('Comida guardada');
  }

  protected readonly deleteMeal = mutation(
    (meal: MealResponse) => this.api.deleteMeal(this.id(), meal.id),
    {
      confirm: (meal) => ({
        header: 'Quitar la comida',
        message: `Se quitará «${meal.name}» del día ${meal.dayNumber}.`,
        acceptLabel: 'Quitar',
        danger: true,
      }),
      success: 'Comida quitada',
      onSuccess: () => this.detail.reload(),
    },
  );

  protected readonly publish = mutation(() => this.api.publish(this.id()), {
    success: 'Plan publicado: ya está en el catálogo',
    onSuccess: (plan) => this.detail.value.set(plan),
  });

  protected readonly archive = mutation(() => this.api.archive(this.id()), {
    confirm: {
      header: 'Archivar el plan',
      message:
        'Dejará de aparecer en el catálogo. Quien ya lo sigue lo conserva. No se puede volver a publicar.',
      acceptLabel: 'Archivar',
      danger: true,
    },
    success: 'Plan archivado',
    onSuccess: (plan) => this.detail.value.set(plan),
  });

  protected readonly remove = mutation(() => this.api.delete(this.id()), {
    confirm: {
      header: 'Eliminar el borrador',
      message: 'Se borrará el plan con todas sus comidas. Esta acción no se puede deshacer.',
      acceptLabel: 'Eliminar',
      danger: true,
    },
    success: 'Borrador eliminado',
    onSuccess: async () => {
      await this.router.navigate(['/nutritionist/meal-plans']);
    },
  });

  protected readonly pending = computed(
    () => this.publish.pending() || this.archive.pending() || this.remove.pending(),
  );
}
