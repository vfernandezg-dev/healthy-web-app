import { Component, inject, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Toaster } from '@core/ui/toaster';
import { PageHeader } from '@shared/ui/page-header';
import { MealPlansApi } from '../data/meal-plans-api';
import { PlanFields, emptyPlan, planSchema, toPlanRequest } from '../ui/plan-fields';
import { formSubmitter } from '@shared/forms/form-submitter';
import { BackLink } from '@shared/ui/back-link';

/** Nuevo plan: se crea como borrador y se pasa a su editor para añadir las comidas. */
@Component({
  selector: 'app-plan-new',
  imports: [BackLink, ButtonDirective, PlanFields, PageHeader],
  template: `
    <app-back-link link=".." label="Tus planes" />
    <app-page-header
      title="Nuevo plan"
      description="Empieza por los datos generales. Después añadirás las comidas de cada día y lo publicarás."
    />
    <form class="card max-w-3xl p-6 sm:p-8" novalidate (submit)="save($event)">
      <app-plan-fields [form]="planForm" />
      <div class="mt-6 flex justify-end">
        <button pButton type="submit" [loading]="planForm().submitting()">
          Crear y añadir comidas
        </button>
      </div>
    </form>
  `,
})
export class PlanNew {
  private readonly submitForm = formSubmitter();
  private readonly api = inject(MealPlansApi);
  private readonly router = inject(Router);
  private readonly toaster = inject(Toaster);

  protected readonly model = signal(emptyPlan());
  protected readonly planForm = form(this.model, planSchema);

  protected save(event: Event): Promise<void> {
    return this.submitForm(event, this.planForm, {
      save: () => this.api.create(toPlanRequest(this.model())),
      onSuccess: async (created) => {
        this.toaster.success('Plan creado', 'Ahora añade sus comidas.');
        await this.router.navigate(['/nutritionist/meal-plans', created.plan.id]);
      },
    });
  }
}
