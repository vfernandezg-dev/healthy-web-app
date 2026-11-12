import { Component, computed, inject, signal } from '@angular/core';
import {
  LucideBadgeCheck,
  LucideCreditCard,
  LucideReceipt,
  LucideTrendingUp,
} from '@lucide/angular';
import { Skeleton } from 'primeng/skeleton';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { StatCard } from '@shared/ui/stat-card';
import { AdminApi } from '../data/admin-api';
import { activeSubscriptions, formatAmounts } from '../data/billing-summary';
import { PaymentsTable } from './payments-table';
import { SubscriptionsTable } from './subscriptions-table';

/** Facturación: resumen (suscripciones vigentes, ingreso recurrente, ingresos y pagos de 30 días) y listados. */
@Component({
  selector: 'app-billing-page',
  imports: [
    Skeleton,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    StatCard,
    SubscriptionsTable,
    PaymentsTable,
    LoadError,
    PageHeader,
  ],
  providers: [MoneyPipe],
  template: `
    <app-page-header
      title="Facturación"
      description="Suscripciones y pagos con PayPal. Los importes van en la moneda de cada plan."
    />

    <section class="mb-10" aria-labelledby="billing-summary-title">
      <h2 id="billing-summary-title" class="sr-only">Resumen</h2>
      @if (summary.error()) {
        <app-load-error [error]="summary.error()" (retry)="summary.reload()" />
      } @else if (summary.hasValue()) {
        <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="list">
          <li>
            <app-stat-card
              label="Suscripciones vigentes"
              [value]="activeTotal()"
              [detail]="activeDetail()"
              [icon]="icons.active"
            />
          </li>
          <li>
            <app-stat-card
              label="Ingreso mensual recurrente"
              [value]="format(summary.value().monthlyRecurringRevenue)"
              [icon]="icons.mrr"
            />
          </li>
          <li>
            <app-stat-card
              label="Ingresos (30 días)"
              [value]="format(summary.value().revenueLast30Days)"
              [icon]="icons.revenue"
            />
          </li>
          <li>
            <app-stat-card
              label="Pagos (30 días)"
              [value]="summary.value().paymentsLast30Days"
              [icon]="icons.payments"
            />
          </li>
        </ul>
      } @else {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
          @for (placeholder of [1, 2, 3, 4]; track placeholder) {
            <p-skeleton height="7rem" borderRadius="1.5rem" />
          }
        </div>
      }
    </section>

    <p-tabs [(value)]="tab">
      <p-tablist>
        <p-tab value="subscriptions">Suscripciones</p-tab>
        <p-tab value="payments">Pagos</p-tab>
      </p-tablist>
      <p-tabpanels class="px-0!">
        <p-tabpanel value="subscriptions">
          @if (tab() === 'subscriptions') {
            <app-subscriptions-table />
          }
        </p-tabpanel>
        <p-tabpanel value="payments">
          @if (tab() === 'payments') {
            <app-payments-table />
          }
        </p-tabpanel>
      </p-tabpanels>
    </p-tabs>
  `,
})
export class BillingPage {
  private readonly api = inject(AdminApi);
  private readonly money = inject(MoneyPipe);

  protected readonly icons = {
    active: LucideBadgeCheck,
    mrr: LucideTrendingUp,
    revenue: LucideCreditCard,
    payments: LucideReceipt,
  };
  protected readonly tab = signal<string | number | undefined>('subscriptions');

  protected readonly summary = this.api.billingSummary();
  private readonly active = computed(() =>
    this.summary.hasValue() ? activeSubscriptions(this.summary.value()) : null,
  );
  protected readonly activeTotal = computed(() => this.active()?.total ?? 0);
  protected readonly activeDetail = computed(() => this.active()?.detail ?? null);

  protected format(amounts: Parameters<typeof formatAmounts>[0]): string {
    return formatAmounts(amounts, (money) => this.money.transform(money));
  }
}
