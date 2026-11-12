import { Component, inject, signal } from '@angular/core';
import { form, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { toProblem } from '../../../core/api/problem';
import { Toaster } from '../../../core/ui/toaster';
import { focusFirstInvalid, serverFieldErrors } from '../../../shared/forms/server-errors';
import { PageHeader } from '../../../shared/ui/page-header';
import { MealPlansApi } from '../data/meal-plans-api';
import { PlanFields, emptyPlan, planSchema, toPlanRequest } from './plan-fields';

/** Nuevo plan: se crea como borrador y se pasa a su editor para añadir las comidas. */
@Component({
  selector: 'app-plan-new',
  imports: [RouterLink, ButtonDirective, ButtonLabel, LucideArrowLeft, PlanFields, PageHeader],
  template: `
    <a
      routerLink=".."
      class="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
    >
      <svg lucideArrowLeft class="size-4"></svg>
      Tus planes
    </a>
    <app-page-header
      title="Nuevo plan"
      description="Empieza por los datos generales. Después añadirás las comidas de cada día y lo publicarás."
    />
    <form class="card max-w-3xl p-6 sm:p-8" novalidate (submit)="onSubmit($event)">
      <app-plan-fields [form]="planForm" />
      <div class="mt-6 flex justify-end">
        <button pButton type="submit" [loading]="planForm().submitting()">
          <span pButtonLabel>Crear y añadir comidas</span>
        </button>
      </div>
    </form>
  `,
})
export class PlanNew {
  private readonly api = inject(MealPlansApi);
  private readonly router = inject(Router);
  private readonly toaster = inject(Toaster);

  protected readonly model = signal(emptyPlan());
  protected readonly planForm = form(this.model, planSchema);

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.planForm, {
      action: async () => {
        try {
          const created = await this.api.create(toPlanRequest(this.model()));
          this.toaster.success('Plan creado', 'Ahora añade sus comidas.');
          await this.router.navigate(['/nutritionist/meal-plans', created.plan.id]);
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
}
