import { I18nPluralPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import type { Role } from '@core/auth/roles';
import { REPORT_TARGET_LABELS, ROLE_PLURAL_LABELS } from '@shared/i18n/labels';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { PageHeader } from '@shared/ui/page-header';
import { SectionHeader } from '@shared/ui/section-header';
import { StatCard } from '@shared/ui/stat-card';
import { longDateLabel } from '@shared/utils/date';
import { activeSubscriptions, formatAmounts } from '../data/billing-summary';
import { AdminApi } from '../data/admin-api';
import { LoadError } from '@shared/ui/load-error';

const ROLES: readonly { role: Role; label: string }[] = (
  Object.keys(ROLE_PLURAL_LABELS) as Role[]
).map((role) => ({ role, label: ROLE_PLURAL_LABELS[role] }));

const OLDEST_REPORTS = 3;

/** Resumen de administración: cuentas, suscripciones e ingresos, denuncias pendientes y cuentas por rol. */
@Component({
  selector: 'app-overview-page',
  imports: [
    LoadError,
    RouterLink,
    I18nPluralPipe,
    ButtonDirective,
    Skeleton,
    PageHeader,
    SectionHeader,
    StatCard,
  ],
  providers: [MoneyPipe],
  templateUrl: './overview-page.html',
})
export class OverviewPage {
  private readonly api = inject(AdminApi);
  private readonly money = inject(MoneyPipe);

  protected readonly today = longDateLabel();
  protected readonly targets = REPORT_TARGET_LABELS;
  protected readonly reportsPlural = {
    '=1': '1 denuncia pendiente',
    other: '# denuncias pendientes',
  };

  protected readonly users = this.api.userSummary();
  protected readonly billing = this.api.billingSummary();
  /** Las tres denuncias abiertas más antiguas (y en la respuesta, cuántas hay). */
  protected readonly reports = this.api.reports(
    signal({ status: 'OPEN' as const, page: 0, size: OLDEST_REPORTS, sort: 'createdAt,asc' }),
  );

  protected readonly kpis = computed(() => {
    if (!this.users.hasValue() || !this.billing.hasValue()) {
      return null;
    }
    const users = this.users.value();
    const billing = this.billing.value();
    const subscriptions = activeSubscriptions(billing);
    return {
      accounts: users.total,
      accountsDetail: `${users.active} activas · ${users.deactivated} desactivadas`,
      newAccounts: users.newLast30Days,
      subscriptions: subscriptions.total,
      subscriptionsDetail: subscriptions.detail,
      mrr: formatAmounts(billing.monthlyRecurringRevenue, (money) => this.money.transform(money)),
    };
  });

  /** Cuentas por rol con su proporción sobre el total (para la barra). */
  protected readonly byRole = computed(() => {
    if (!this.users.hasValue()) {
      return [];
    }
    const { byRole, total } = this.users.value();
    return ROLES.map(({ role, label }) => {
      const count = byRole[role] ?? 0;
      return { role, label, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 };
    });
  });

  protected readonly oldestReports = computed(() =>
    this.reports.hasValue() ? this.reports.value().content : [],
  );
}
