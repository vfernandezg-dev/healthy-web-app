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
import { PersonCell } from '@shared/ui/person-cell';

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
    PersonCell,
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
  templateUrl: './subscriptions-table.html',
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
