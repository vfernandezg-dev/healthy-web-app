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
import { Badge } from '@shared/ui/badge';

/** Catálogo de planes publicados, con los que sigue el cliente arriba. */
@Component({
  selector: 'app-meal-plan-catalog',
  imports: [
    Badge,
    PagedGrid,
    RowTemplate,
    FormField,
    SelectButton,
    PlanCard,
    EmptyState,
    PageHeader,
  ],
  templateUrl: './meal-plan-catalog.html',
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
