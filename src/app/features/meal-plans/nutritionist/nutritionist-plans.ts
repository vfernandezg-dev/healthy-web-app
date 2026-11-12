import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucidePlus, LucideUtensils } from '@lucide/angular';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { type PaginatorState, Paginator } from 'primeng/paginator';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import { PUBLICATION_STATUS_LABELS, PUBLICATION_STATUS_SEVERITY } from '@shared/i18n/labels';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { MealPlansApi } from '../data/meal-plans-api';
import { PlanCard } from '../ui/plan-card';

/** Los planes del nutricionista, en cualquier estado. */
@Component({
  selector: 'app-nutritionist-plans',
  imports: [
    RouterLink,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Paginator,
    Skeleton,
    Tag,
    LucidePlus,
    PlanCard,
    EmptyState,
    LoadError,
    PageHeader,
  ],
  template: `
    <app-page-header
      title="Tus planes"
      description="Crea planes alimenticios, organiza sus comidas día a día y publícalos para tus clientes."
    >
      <a pButton routerLink="new">
        <svg lucidePlus pButtonIcon></svg>
        <span pButtonLabel>Nuevo plan</span>
      </a>
    </app-page-header>

    @if (plans.error()) {
      <app-load-error [error]="plans.error()" (retry)="plans.reload()" />
    } @else if (plans.hasValue()) {
      @let page = plans.value();
      @if (page.content.length === 0) {
        <app-empty-state
          [icon]="emptyIcon"
          title="Aún no has creado ningún plan"
          description="Tus planes aparecerán aquí: primero como borrador y, al publicarlos, en el catálogo."
        >
          <a pButton routerLink="new"><span pButtonLabel>Crear mi primer plan</span></a>
        </app-empty-state>
      } @else {
        <ul class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="list">
          @for (plan of page.content; track plan.id) {
            <li>
              <app-plan-card [plan]="plan" [link]="plan.id">
                <p-tag
                  [value]="statusLabels[plan.status]"
                  [severity]="statusSeverity[plan.status]"
                />
              </app-plan-card>
            </li>
          }
        </ul>
        @if (page.page.totalPages > 1) {
          <p-paginator
            class="mt-6 block"
            [first]="page.page.number * 20"
            [rows]="20"
            [totalRecords]="page.page.totalElements"
            (onPageChange)="changePage($event)"
          />
        }
      }
    } @else {
      <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
        @for (placeholder of [1, 2, 3]; track placeholder) {
          <p-skeleton height="14rem" borderRadius="1.5rem" />
        }
      </div>
    }
  `,
})
export class NutritionistPlans {
  private readonly api = inject(MealPlansApi);
  private readonly page = signal(0);

  protected readonly plans = this.api.mine(this.page);
  protected readonly statusLabels = PUBLICATION_STATUS_LABELS;
  protected readonly statusSeverity = PUBLICATION_STATUS_SEVERITY;
  protected readonly emptyIcon = LucideUtensils;

  protected changePage(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
  }
}
