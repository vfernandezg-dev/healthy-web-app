import { Component, computed, inject, signal } from '@angular/core';
import { LucideUtensils } from '@lucide/angular';
import { SelectButton } from 'primeng/selectbutton';
import { GOAL_LABELS, withAllOption } from '@shared/i18n/labels';
import { EmptyState } from '@shared/ui/empty-state';
import { PageHeader } from '@shared/ui/page-header';
import { MealPlansApi, type CatalogFilters } from '../data/meal-plans-api';
import { PlanCard } from '../ui/plan-card';
import { pagedQuery } from '@shared/table/paged-query';
import { PAGE_SIZE } from '@shared/table/page-size';
import { PagedGrid } from '@shared/table/paged-grid';
import { RowTemplate } from '@shared/table/row-template';
import { FormField, form } from '@angular/forms/signals';

/** Catálogo de planes publicados, con los que sigue el cliente arriba. */
@Component({
  selector: 'app-meal-plan-catalog',
  imports: [PagedGrid, RowTemplate, FormField, SelectButton, PlanCard, EmptyState, PageHeader],
  template: `
    <app-page-header
      title="Planes alimenticios"
      description="Planes creados por nuestros nutricionistas, con sus comidas día a día. Síguelos para tenerlos a mano."
    />

    @if (following().length > 0) {
      <section class="mb-10" aria-labelledby="following-title">
        <h2 id="following-title" class="mb-4 text-xl font-bold">Los planes que sigues</h2>
        <ul class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="list">
          @for (enrollment of following(); track enrollment.id) {
            <li>
              <app-plan-card [plan]="enrollment.plan" [link]="enrollment.plan.id">
                @if (enrollment.source === 'REWARD') {
                  <span
                    class="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900"
                    >Premio</span
                  >
                }
              </app-plan-card>
            </li>
          }
        </ul>
      </section>
    }

    <section aria-labelledby="catalog-title">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="catalog-title" class="text-xl font-bold">Todos los planes</h2>
        <p-selectbutton
          [options]="goalOptions"
          optionLabel="label"
          optionValue="value"
          [allowEmpty]="false"
          ariaLabelledBy="catalog-title"
          [formField]="filters.goal"
        />
      </div>

      <app-paged-grid [query]="catalog" skeletonHeight="15rem">
        <ng-template [appRow]="catalog.items()" let-plan>
          <app-plan-card [plan]="plan" [link]="plan.id" />
        </ng-template>
        <div empty>
          <app-empty-state
            [icon]="emptyIcon"
            title="No hay planes con ese objetivo"
            description="Prueba con otro objetivo: los nutricionistas publican planes nuevos a menudo."
          />
        </div>
      </app-paged-grid>
    </section>
  `,
})
export class MealPlanCatalog {
  private readonly api = inject(MealPlansApi);

  protected readonly emptyIcon = LucideUtensils;
  protected readonly goalOptions = withAllOption('Todos', GOAL_LABELS);

  private readonly filterModel = signal<CatalogFilters>({ goal: null });
  protected readonly filters = form(this.filterModel);
  protected readonly catalog = pagedQuery({
    filters: this.filterModel,
    defaultSort: 'publishedAt,desc',
    pageSize: PAGE_SIZE.grid,
    load: (request) => this.api.catalog(request),
  });
  private readonly enrollments = this.api.enrollments();
  protected readonly following = computed(() =>
    this.enrollments.hasValue() ? this.enrollments.value() : [],
  );
}
