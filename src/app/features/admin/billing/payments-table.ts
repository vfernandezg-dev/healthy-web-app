import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { SortIcon as TableSortIcon, SortableColumn, Table } from 'primeng/table';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONE, withAllOption } from '@shared/i18n/labels';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { LoadError } from '@shared/ui/load-error';
import { SortIcon } from '@shared/ui/sort-icon';
import { AdminApi, type PaymentFilters } from '../data/admin-api';
import { RowTemplate } from '@shared/table/row-template';
import { FormField, form } from '@angular/forms/signals';
import { pagedQuery } from '@shared/table/paged-query';
import { PAGE_SIZE } from '@shared/table/page-size';
import { PersonCell } from '@shared/ui/person-cell';
import { Badge } from '@shared/ui/badge';

const DEFAULT_SORT = 'createdAt,desc';

/** Pagos con PayPal: titular, importe, estado, pedido y fecha; filtro por estado. */
@Component({
  selector: 'app-payments-table',
  imports: [
    PersonCell,
    FormField,
    DatePipe,
    MoneyPipe,
    Select,
    Skeleton,
    Badge,
    Table,
    SortableColumn,
    TableSortIcon,
    SortIcon,
    RowTemplate,
    LoadError,
  ],
  host: { class: 'block' },
  templateUrl: './payments-table.html',
})
export class PaymentsTable {
  private readonly api = inject(AdminApi);

  protected readonly statuses = PAYMENT_STATUS_LABELS;
  protected readonly tones = PAYMENT_STATUS_TONE;
  protected readonly statusOptions = withAllOption('Todos los estados', PAYMENT_STATUS_LABELS);

  private readonly filterModel = signal<PaymentFilters>({ status: null });
  protected readonly filters = form(this.filterModel);
  protected readonly payments = pagedQuery({
    filters: this.filterModel,
    defaultSort: DEFAULT_SORT,
    pageSize: PAGE_SIZE.table,
    load: (request) => this.api.payments(request),
  });
}
