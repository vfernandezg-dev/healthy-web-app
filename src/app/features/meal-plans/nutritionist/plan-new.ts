import { Component, inject, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { Toaster } from '@core/ui/toaster';
import { PageHeader } from '@shared/ui/page-header';
import { MealPlansApi } from '../data/meal-plans-api';
import { PlanFields, emptyPlan, planSchema, toPlanRequest } from '../ui/plan-fields';
import { formSubmitter } from '@shared/forms/form-submitter';

/** Nuevo plan: se crea como borrador y se pasa a su editor para añadir las comidas. */
@Component({
  selector: 'app-plan-new',
  imports: [RouterLink, ButtonDirective, LucideArrowLeft, PlanFields, PageHeader],
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
