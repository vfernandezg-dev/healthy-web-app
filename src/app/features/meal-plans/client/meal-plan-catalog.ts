import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideUtensils } from '@lucide/angular';
import { type PaginatorState, Paginator } from 'primeng/paginator';
import { SelectButton } from 'primeng/selectbutton';
import { Skeleton } from 'primeng/skeleton';
import { GOAL_LABELS, type MealPlanGoal, optionsOf } from '@shared/i18n/labels';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { CATALOG_PAGE_SIZE, MealPlansApi } from '../data/meal-plans-api';
import { PlanCard } from '../ui/plan-card';

/** Catálogo de planes publicados, con los que sigue el cliente arriba. */
@Component({
  selector: 'app-meal-plan-catalog',
  imports: [
    FormsModule,
    SelectButton,
    Paginator,
    Skeleton,
    PlanCard,
    EmptyState,
    LoadError,
    PageHeader,
  ],
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
          [ngModel]="goal()"
          (ngModelChange)="filter($event)"
        />
      </div>

      @if (catalog.error()) {
        <app-load-error [error]="catalog.error()" (retry)="catalog.reload()" />
      } @else if (catalog.hasValue()) {
        @let page = catalog.value();
        @if (page.content.length === 0) {
          <app-empty-state
            [icon]="emptyIcon"
            title="No hay planes con ese objetivo"
            description="Prueba con otro objetivo: los nutricionistas publican planes nuevos a menudo."
          />
        } @else {
          <ul class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="list">
            @for (plan of page.content; track plan.id) {
              <li><app-plan-card [plan]="plan" [link]="plan.id" /></li>
            }
          </ul>
          @if (page.page.totalPages > 1) {
            <p-paginator
              class="mt-6 block"
              [first]="page.page.number * pageSize"
              [rows]="pageSize"
              [totalRecords]="page.page.totalElements"
              (onPageChange)="changePage($event)"
            />
          }
        }
      } @else {
        <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          @for (placeholder of [1, 2, 3]; track placeholder) {
            <p-skeleton height="15rem" borderRadius="1.5rem" />
          }
        </div>
      }
    </section>
  `,
})
export class MealPlanCatalog {
  private readonly api = inject(MealPlansApi);

  protected readonly pageSize = CATALOG_PAGE_SIZE;
  protected readonly emptyIcon = LucideUtensils;
  protected readonly goalOptions = [{ label: 'Todos', value: null }, ...optionsOf(GOAL_LABELS)];

  protected readonly goal = signal<MealPlanGoal | null>(null);
  private readonly page = signal(0);
  protected readonly catalog = this.api.catalog(
    computed(() => ({ goal: this.goal(), page: this.page() })),
  );
  private readonly enrollments = this.api.enrollments();
  protected readonly following = computed(() =>
    this.enrollments.hasValue() ? this.enrollments.value() : [],
  );

  protected filter(goal: MealPlanGoal | null): void {
    this.goal.set(goal);
    this.page.set(0);
  }

  protected changePage(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
  }
}
