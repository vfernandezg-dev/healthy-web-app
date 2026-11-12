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
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_SEVERITY, optionsOf } from '@shared/i18n/labels';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { type PageQuery, pageQueryOf, samePageQuery } from '@shared/table/page-query';
import { LoadError } from '@shared/ui/load-error';
import { SortIcon } from '@shared/ui/sort-icon';
import { ADMIN_PAGE_SIZE, AdminApi } from '../data/admin-api';
import { RowTemplate } from '@shared/table/row-template';
import { lastValue, sameValues } from '@shared/utils/last-value';

const DEFAULT_SORT = 'createdAt,desc';

/** Pagos con PayPal: titular, importe, estado, pedido y fecha; filtro por estado. */
@Component({
  selector: 'app-payments-table',
  imports: [
    FormsModule,
    DatePipe,
    NgTemplateOutlet,
    MoneyPipe,
    Select,
    Skeleton,
    Tag,
    Table,
    SortableColumn,
    TableSortIcon,
    SortIcon,
    RowTemplate,
    LoadError,
  ],
  host: { class: 'block' },
  template: `
    <div class="mb-4">
      <p-select
        [options]="statusOptions"
        optionLabel="label"
        optionValue="value"
        ariaLabel="Estado del pago"
        [(ngModel)]="status"
      />
    </div>

    @if (payments.error()) {
      <app-load-error [error]="payments.error()" (retry)="payments.reload()" />
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
          [loading]="payments.isLoading()"
          [scrollable]="true"
          [rowHover]="true"
          tableStyleClass="md:min-w-[52rem]"
          (onLazyLoad)="load($event)"
        >
          <ng-template #header>
            <tr class="max-md:hidden">
              <th scope="col">Titular</th>
              <th scope="col" class="text-right">Importe</th>
              <th scope="col">Estado</th>
              <th scope="col">Pedido de PayPal</th>
              <th pSortableColumn="createdAt" scope="col">
                Fecha <p-sort-icon field="createdAt" />
              </th>
            </tr>
          </ng-template>
          <ng-template #body let-payment [appRow]="items()">
            <tr>
              <td class="md:hidden" colspan="5">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <ng-container
                      *ngTemplateOutlet="customer; context: { $implicit: payment.customer }"
                    />
                  </div>
                  <p class="font-semibold tabular-nums">{{ payment.amount | money }}</p>
                </div>
                <div class="mt-3 flex flex-wrap items-center gap-2">
                  <p-tag
                    [value]="statuses[payment.status]"
                    [severity]="severities[payment.status]"
                  />
                  <span class="text-sm text-muted">
                    {{ payment.capturedAt ?? payment.createdAt | date: 'd MMM y, HH:mm' }}
                  </span>
                </div>
                <p class="mt-2 truncate font-mono text-xs text-muted">
                  {{ payment.providerOrderId }}
                </p>
              </td>
              <td class="max-md:hidden">
                <ng-container
                  *ngTemplateOutlet="customer; context: { $implicit: payment.customer }"
                />
              </td>
              <td class="text-right font-semibold tabular-nums max-md:hidden">
                {{ payment.amount | money }}
              </td>
              <td class="max-md:hidden">
                <p-tag [value]="statuses[payment.status]" [severity]="severities[payment.status]" />
              </td>
              <td class="font-mono text-xs max-md:hidden">{{ payment.providerOrderId }}</td>
              <td class="max-md:hidden">
                {{ payment.capturedAt ?? payment.createdAt | date: 'd MMM y, HH:mm' }}
              </td>
            </tr>
          </ng-template>
          <ng-template #emptymessage>
            <tr>
              <td colspan="5" class="py-10 text-center text-muted">No hay pagos con ese estado.</td>
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
      <p class="truncate font-semibold">{{ customer?.name ?? 'Cuenta eliminada' }}</p>
      @if (customer) {
        <p class="truncate text-sm text-muted">{{ customer.email }}</p>
      }
    </ng-template>
  `,
})
export class PaymentsTable {
  private readonly api = inject(AdminApi);

  protected readonly pageSize = ADMIN_PAGE_SIZE;
  protected readonly statuses = PAYMENT_STATUS_LABELS;
  protected readonly severities = PAYMENT_STATUS_SEVERITY;
  protected readonly statusOptions = [
    { label: 'Todos los estados', value: null },
    ...optionsOf(PAYMENT_STATUS_LABELS),
  ];

  protected readonly status = signal<string | null>(null);
  private readonly query = linkedSignal<unknown, PageQuery>({
    source: this.status,
    computation: (_, previous) => ({ page: 0, sort: previous?.value.sort ?? DEFAULT_SORT }),
    equal: samePageQuery,
  });
  protected readonly first = computed(() => this.query().page * this.pageSize);

  protected readonly payments = this.api.payments(
    computed(() => ({ status: this.status(), ...this.query() }), { equal: sameValues }),
  );
  /** La última página recibida: la tabla la conserva mientras carga la siguiente. */
  protected readonly result = lastValue(this.payments);
  protected readonly items = computed(() => this.result()?.content ?? []);
  protected readonly total = computed(() => this.result()?.page.totalElements ?? 0);

  protected load(event: TableLazyLoadEvent): void {
    this.query.set(pageQueryOf(event, this.pageSize, DEFAULT_SORT));
  }
}
