import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import {
  SortIcon as TableSortIcon,
  SortableColumn,
  Table,
  type TableLazyLoadEvent,
} from 'primeng/table';
import { Tag } from 'primeng/tag';
import {
  SUBSCRIPTION_STATUS_LABELS,
  SUBSCRIPTION_STATUS_SEVERITY,
  TIER_LABELS,
  optionsOf,
} from '@shared/i18n/labels';
import { type PageQuery, pageQueryOf, samePageQuery } from '@shared/table/page-query';
import { LoadError } from '@shared/ui/load-error';
import { SortIcon } from '@shared/ui/sort-icon';
import { TierBadge } from '@shared/ui/tier-badge';
import { ADMIN_PAGE_SIZE, AdminApi } from '../data/admin-api';
import { RowTemplate } from '@shared/table/row-template';
import { lastValue, sameValues } from '@shared/utils/last-value';

const DEFAULT_SORT = 'createdAt,desc';

/** Suscripciones con su titular, nivel, estado y período; filtros por estado y nivel. */
@Component({
  selector: 'app-subscriptions-table',
  imports: [
    FormsModule,
    DatePipe,
    NgTemplateOutlet,
    Select,
    Skeleton,
    Tag,
    Table,
    SortableColumn,
    TableSortIcon,
    SortIcon,
    RowTemplate,
    TierBadge,
    LoadError,
  ],
  host: { class: 'block' },
  template: `
    <div class="mb-4 flex flex-wrap gap-3">
      <p-select
        [options]="statusOptions"
        optionLabel="label"
        optionValue="value"
        ariaLabel="Estado de la suscripción"
        [(ngModel)]="status"
      />
      <p-select
        [options]="tierOptions"
        optionLabel="label"
        optionValue="value"
        ariaLabel="Nivel"
        [(ngModel)]="tier"
      />
    </div>

    @if (subscriptions.error()) {
      <app-load-error [error]="subscriptions.error()" (retry)="subscriptions.reload()" />
    } @else if (result()) {
      <div class="card overflow-hidden">
        <p-table
          [value]="items()"
          [lazy]="true"
          dataKey="id"
          [totalRecords]="total()"
          [rows]="pageSize"
          [first]="first()"
          [paginator]="total() > pageSize"
          sortField="createdAt"
          [sortOrder]="-1"
          [loading]="subscriptions.isLoading()"
          [scrollable]="true"
          [rowHover]="true"
          tableStyleClass="md:min-w-[52rem]"
          (onLazyLoad)="load($event)"
        >
          <ng-template #header>
            <tr class="max-md:hidden">
              <th scope="col">Titular</th>
              <th scope="col">Nivel</th>
              <th scope="col">Estado</th>
              <th pSortableColumn="currentPeriodEnd" scope="col">
                Período <p-sort-icon field="currentPeriodEnd" />
              </th>
              <th pSortableColumn="createdAt" scope="col">
                Alta <p-sort-icon field="createdAt" />
              </th>
            </tr>
          </ng-template>
          <ng-template #body let-subscription [appRow]="items()">
            <tr>
              <td class="md:hidden" colspan="5">
                <ng-container
                  *ngTemplateOutlet="customer; context: { $implicit: subscription.customer }"
                />
                <div class="mt-3 flex flex-wrap items-center gap-2">
                  <app-tier-badge [tier]="subscription.tier" />
                  <p-tag
                    [value]="statuses[subscription.status]"
                    [severity]="severities[subscription.status]"
                  />
                </div>
                <p class="mt-2 text-sm text-muted">
                  <ng-container *ngTemplateOutlet="period; context: { $implicit: subscription }" />
                </p>
              </td>
              <td class="max-md:hidden">
                <ng-container
                  *ngTemplateOutlet="customer; context: { $implicit: subscription.customer }"
                />
              </td>
              <td class="max-md:hidden"><app-tier-badge [tier]="subscription.tier" /></td>
              <td class="max-md:hidden">
                <p-tag
                  [value]="statuses[subscription.status]"
                  [severity]="severities[subscription.status]"
                />
              </td>
              <td class="max-md:hidden">
                <ng-container *ngTemplateOutlet="period; context: { $implicit: subscription }" />
              </td>
              <td class="max-md:hidden">{{ subscription.createdAt | date: 'mediumDate' }}</td>
            </tr>
          </ng-template>
          <ng-template #emptymessage>
            <tr>
              <td colspan="5" class="py-10 text-center text-muted">
                No hay suscripciones con esos filtros.
              </td>
            </tr>
          </ng-template>
          <ng-template #sorticon let-order>
            <app-sort-icon [order]="order" />
          </ng-template>
        </p-table>
      </div>
    } @else {
      <p-skeleton height="20rem" borderRadius="1.5rem" />
    }

    <ng-template #customer let-customer>
      <p class="font-semibold">{{ customer?.name ?? 'Cuenta eliminada' }}</p>
      @if (customer) {
        <p class="text-sm text-muted">{{ customer.email }}</p>
      }
    </ng-template>

    <ng-template #period let-subscription [appRow]="items()">
      @if (subscription.currentPeriodStart && subscription.currentPeriodEnd) {
        {{ subscription.currentPeriodStart | date: 'mediumDate' }} –
        {{ subscription.currentPeriodEnd | date: 'mediumDate' }}
      } @else {
        <span class="text-muted">Sin pagar</span>
      }
    </ng-template>
  `,
})
export class SubscriptionsTable {
  private readonly api = inject(AdminApi);

  protected readonly pageSize = ADMIN_PAGE_SIZE;
  protected readonly statuses = SUBSCRIPTION_STATUS_LABELS;
  protected readonly severities = SUBSCRIPTION_STATUS_SEVERITY;
  protected readonly statusOptions = [
    { label: 'Todos los estados', value: null },
    ...optionsOf(SUBSCRIPTION_STATUS_LABELS),
  ];
  protected readonly tierOptions = [
    { label: 'Todos los niveles', value: null },
    { label: TIER_LABELS.PREMIUM, value: 'PREMIUM' },
    { label: TIER_LABELS.VIP, value: 'VIP' },
  ];

  protected readonly status = signal<string | null>(null);
  protected readonly tier = signal<string | null>(null);
  private readonly query = linkedSignal<unknown, PageQuery>({
    source: () => [this.status(), this.tier()],
    computation: (_, previous) => ({ page: 0, sort: previous?.value.sort ?? DEFAULT_SORT }),
    equal: samePageQuery,
  });
  protected readonly first = computed(() => this.query().page * this.pageSize);

  protected readonly subscriptions = this.api.subscriptions(
    computed(() => ({ status: this.status(), tier: this.tier(), ...this.query() }), {
      equal: sameValues,
    }),
  );
  /** La última página recibida: la tabla la conserva mientras carga la siguiente. */
  protected readonly result = lastValue(this.subscriptions);
  protected readonly items = computed(() => this.result()?.content ?? []);
  protected readonly total = computed(() => this.result()?.page.totalElements ?? 0);

  protected load(event: TableLazyLoadEvent): void {
    this.query.set(pageQueryOf(event, this.pageSize, DEFAULT_SORT));
  }
}
