import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { form, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import {
  LucideArchive,
  LucideArrowLeft,
  LucidePencil,
  LucidePlus,
  LucideSend,
  LucideTrash,
} from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import { toProblem } from '@core/api/problem';
import type { MealPlanDetailResponse, MealResponse } from '@core/api/schema';
import { Confirmer } from '@core/ui/confirmer';
import { Toaster } from '@core/ui/toaster';
import { focusFirstInvalid, serverFieldErrors } from '@shared/forms/server-errors';
import {
  MEAL_CATEGORY_LABELS,
  PUBLICATION_STATUS_LABELS,
  PUBLICATION_STATUS_SEVERITY,
} from '@shared/i18n/labels';
import { LoadError } from '@shared/ui/load-error';
import { MealPlansApi } from '../data/meal-plans-api';
import { mealsByDay } from '../data/meals-by-day';
import { MealDialog, type MealTarget } from './meal-dialog';
import { PlanFields, emptyPlan, planModelOf, planSchema, toPlanRequest } from '../ui/plan-fields';
import { dialogState } from '@shared/ui/dialog-state';

/** Editor de un plan del nutricionista: datos, comidas por día y publicación. */
@Component({
  selector: 'app-plan-editor',
  imports: [
    RouterLink,
    DecimalPipe,
    ButtonDirective,
    Skeleton,
    Tag,
    LucideArrowLeft,
    LucidePlus,
    LucidePencil,
    LucideTrash,
    LucideSend,
    LucideArchive,
    PlanFields,
    MealDialog,
    LoadError,
  ],
  templateUrl: './plan-editor.html',
})
export class PlanEditor {
  private readonly api = inject(MealPlansApi);
  private readonly router = inject(Router);
  private readonly toaster = inject(Toaster);
  private readonly confirmer = inject(Confirmer);
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
  protected readonly statusSeverity = PUBLICATION_STATUS_SEVERITY;
  protected readonly busy = signal(false);

  protected readonly model = linkedSignal(() => {
    const current = this.current();
    return current ? planModelOf(current) : emptyPlan();
  });
  protected readonly planForm = form(this.model, planSchema);

  protected async savePlan(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.planForm, {
      action: async () => {
        try {
          this.detail.value.set(await this.api.update(this.id(), toPlanRequest(this.model())));
          this.planForm().reset();
          this.toaster.success('Plan guardado');
          return undefined;
        } catch (error) {
          const problem = toProblem(error);
          if (problem.errors.length > 0) {
            return serverFieldErrors(this.planForm, problem);
          }
          this.toaster.problem(problem);
          return undefined;
        }
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }

  protected mealSaved(): void {
    this.detail.reload();
    this.toaster.success('Comida guardada');
  }

  protected async deleteMeal(meal: MealResponse): Promise<void> {
    const confirmed = await this.confirmer.ask({
      header: 'Quitar la comida',
      message: `Se quitará «${meal.name}» del día ${meal.dayNumber}.`,
      acceptLabel: 'Quitar',
      danger: true,
    });
    if (confirmed) {
      await this.run(async () => {
        await this.api.deleteMeal(this.id(), meal.id);
        this.detail.reload();
      }, 'Comida quitada');
    }
  }

  protected async publish(): Promise<void> {
    await this.run(async () => {
      this.detail.value.set(await this.api.publish(this.id()));
    }, 'Plan publicado: ya está en el catálogo');
  }

  protected async archive(): Promise<void> {
    const confirmed = await this.confirmer.ask({
      header: 'Archivar el plan',
      message:
        'Dejará de aparecer en el catálogo. Quien ya lo sigue lo conserva. No se puede volver a publicar.',
      acceptLabel: 'Archivar',
      danger: true,
    });
    if (confirmed) {
      await this.run(async () => {
        this.detail.value.set(await this.api.archive(this.id()));
      }, 'Plan archivado');
    }
  }

  protected async remove(): Promise<void> {
    const confirmed = await this.confirmer.ask({
      header: 'Eliminar el borrador',
      message: 'Se borrará el plan con todas sus comidas. Esta acción no se puede deshacer.',
      acceptLabel: 'Eliminar',
      danger: true,
    });
    if (confirmed) {
      await this.run(async () => {
        await this.api.delete(this.id());
        await this.router.navigate(['/nutritionist/meal-plans']);
      }, 'Borrador eliminado');
    }
  }

  /** Ejecuta una acción con el estado «ocupado»; si falla, el interceptor ya ha avisado. */
  private async run(action: () => Promise<void>, success: string): Promise<void> {
    this.busy.set(true);
    try {
      await action();
      this.toaster.success(success);
    } catch {
      // El interceptor de errores ya ha avisado.
    } finally {
      this.busy.set(false);
    }
  }
}
