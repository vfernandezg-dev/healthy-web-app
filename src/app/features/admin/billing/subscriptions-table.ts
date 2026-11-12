import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { SortIcon as TableSortIcon, SortableColumn, Table } from 'primeng/table';
import { Tag } from 'primeng/tag';
import {
  SUBSCRIPTION_STATUS_LABELS,
  SUBSCRIPTION_STATUS_SEVERITY,
  TIER_LABELS,
  withAllOption,
  type Tier,
} from '@shared/i18n/labels';
import { LoadError } from '@shared/ui/load-error';
import { SortIcon } from '@shared/ui/sort-icon';
import { TierBadge } from '@shared/ui/tier-badge';
import { AdminApi, type SubscriptionFilters } from '../data/admin-api';
import { RowTemplate } from '@shared/table/row-template';
import { FormField, form } from '@angular/forms/signals';
import { pagedQuery } from '@shared/table/paged-query';
import { PAGE_SIZE } from '@shared/table/page-size';

const DEFAULT_SORT = 'createdAt,desc';

/** Niveles de pago (las suscripciones son de PREMIUM o VIP). */
const PAID_TIERS: Readonly<Record<Exclude<Tier, 'BASIC'>, string>> = {
  PREMIUM: TIER_LABELS.PREMIUM,
  VIP: TIER_LABELS.VIP,
};

/** Suscripciones con su titular, nivel, estado y período; filtros por estado y nivel. */
@Component({
  selector: 'app-subscriptions-table',
  imports: [
    FormField,
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
        [formField]="filters.status"
      />
      <p-select
        [options]="tierOptions"
        optionLabel="label"
        optionValue="value"
        ariaLabel="Nivel"
        [formField]="filters.tier"
      />
    </div>

    @if (subscriptions.error()) {
      <app-load-error [error]="subscriptions.error()" (retry)="subscriptions.reload()" />
    } @else if (subscriptions.page()) {
      <div class="card overflow-hidden">
        <p-table
          [value]="subscriptions.items()"
          [lazy]="true"
          dataKey="id"
          [totalRecords]="subscriptions.total()"
          [rows]="subscriptions.pageSize"
          [first]="subscriptions.first()"
          [paginator]="subscriptions.total() > subscriptions.pageSize"
          sortField="createdAt"
          [sortOrder]="-1"
          [loading]="subscriptions.loading()"
          [scrollable]="true"
          [rowHover]="true"
          tableStyleClass="md:min-w-[52rem]"
          (onLazyLoad)="subscriptions.onLazyLoad($event)"
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
          <ng-template #body let-subscription [appRow]="subscriptions.items()">
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

    <ng-template #period let-subscription [appRow]="subscriptions.items()">
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

  protected readonly statuses = SUBSCRIPTION_STATUS_LABELS;
  protected readonly severities = SUBSCRIPTION_STATUS_SEVERITY;
  protected readonly statusOptions = withAllOption('Todos los estados', SUBSCRIPTION_STATUS_LABELS);
  protected readonly tierOptions = withAllOption('Todos los niveles', PAID_TIERS);

  private readonly filterModel = signal<SubscriptionFilters>({ status: null, tier: null });
  protected readonly filters = form(this.filterModel);
  protected readonly subscriptions = pagedQuery({
    filters: this.filterModel,
    defaultSort: DEFAULT_SORT,
    pageSize: PAGE_SIZE.table,
    load: (request) => this.api.subscriptions(request),
  });
}
