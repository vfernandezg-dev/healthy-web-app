import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucidePlus, LucideUtensils } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { PUBLICATION_STATUS_LABELS, PUBLICATION_STATUS_TONE } from '@shared/i18n/labels';
import { EmptyState } from '@shared/ui/empty-state';
import { PageHeader } from '@shared/ui/page-header';
import { MealPlansApi, type OwnPlanFilters } from '../data/meal-plans-api';
import { PlanCard } from '../ui/plan-card';
import { pagedQuery } from '@shared/table/paged-query';
import { PAGE_SIZE } from '@shared/table/page-size';
import { PagedGrid } from '@shared/table/paged-grid';
import { RowTemplate } from '@shared/table/row-template';
import { Badge } from '@shared/ui/badge';

/** Los planes del nutricionista, en cualquier estado. */
@Component({
  selector: 'app-nutritionist-plans',
  imports: [
    PagedGrid,
    RowTemplate,
    RouterLink,
    ButtonDirective,
    Badge,
    LucidePlus,
    PlanCard,
    EmptyState,
    PageHeader,
  ],
  template: `
    <app-page-header
      title="Tus planes"
      description="Crea planes alimenticios, organiza sus comidas día a día y publícalos para tus clientes."
    >
      <a pButton routerLink="new">
        <svg lucidePlus></svg>
        Nuevo plan
      </a>
    </app-page-header>

    <app-paged-grid [query]="plans" label="Tus planes">
      <ng-template [appRow]="plans.items()" let-plan>
        <app-plan-card [plan]="plan" [link]="plan.id">
          <app-badge [tone]="statusTones[plan.status]">{{ statusLabels[plan.status] }}</app-badge>
        </app-plan-card>
      </ng-template>
      <div empty>
        <app-empty-state
          [icon]="emptyIcon"
          title="Aún no has creado ningún plan"
          description="Tus planes aparecerán aquí: primero como borrador y, al publicarlos, en el catálogo."
        >
          <a pButton routerLink="new">Crear mi primer plan</a>
        </app-empty-state>
      </div>
    </app-paged-grid>
  `,
})
export class NutritionistPlans {
  private readonly api = inject(MealPlansApi);
  protected readonly plans = pagedQuery({
    filters: signal<OwnPlanFilters>({ status: null }),
    defaultSort: 'updatedAt,desc',
    pageSize: PAGE_SIZE.grid,
    load: (request) => this.api.mine(request),
  });
  protected readonly statusLabels = PUBLICATION_STATUS_LABELS;
  protected readonly statusTones = PUBLICATION_STATUS_TONE;
  protected readonly emptyIcon = LucideUtensils;
}
