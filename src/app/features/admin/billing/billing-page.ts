import { Component, computed, inject, signal } from '@angular/core';
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
  templateUrl: './billing-page.html',
})
export class BillingPage {
  private readonly api = inject(AdminApi);
  private readonly money = inject(MoneyPipe);

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
