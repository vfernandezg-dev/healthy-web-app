import { I18nPluralPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBadgeCheck,
  LucideTrendingUp,
  LucideUserPlus,
  LucideUsers,
} from '@lucide/angular';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { NAVIGATION } from '../../../layout/app-shell/nav-config';
import { type Role, REPORT_TARGET_LABELS } from '../../../shared/i18n/labels';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { PageHeader } from '../../../shared/ui/page-header';
import { StatCard } from '../../../shared/ui/stat-card';
import { Shortcuts } from '../../dashboard/shortcuts';
import { activeSubscriptions, formatAmounts } from '../billing/billing-summary';
import { AdminApi } from '../data/admin-api';

const ROLES: readonly { role: Role; label: string }[] = [
  { role: 'CLIENT', label: 'Clientes' },
  { role: 'NUTRITIONIST', label: 'Nutricionistas' },
  { role: 'ADMIN', label: 'Administración' },
];

/** Resumen de administración: cuentas, suscripciones e ingresos, denuncias pendientes y cuentas por rol. */
@Component({
  selector: 'app-overview-page',
  imports: [
    RouterLink,
    I18nPluralPipe,
    ButtonDirective,
    ButtonLabel,
    Skeleton,
    LucideArrowRight,
    PageHeader,
    StatCard,
    Shortcuts,
  ],
  providers: [MoneyPipe],
  templateUrl: './overview-page.html',
})
export class OverviewPage {
  private readonly api = inject(AdminApi);
  private readonly money = inject(MoneyPipe);

  protected readonly shortcuts = NAVIGATION.ADMIN.filter((item) => item.description);
  protected readonly targets = REPORT_TARGET_LABELS;
  protected readonly icons = {
    users: LucideUsers,
    newUsers: LucideUserPlus,
    subscriptions: LucideBadgeCheck,
    mrr: LucideTrendingUp,
  };
  protected readonly reportsPlural = {
    '=1': '1 denuncia pendiente',
    other: '# denuncias pendientes',
  };

  protected readonly users = this.api.userSummary();
  protected readonly billing = this.api.billingSummary();
  /** Las denuncias abiertas, de la más antigua a la más reciente. */
  protected readonly reports = this.api.reports(
    signal({ status: 'OPEN' as const, page: 0, sort: 'createdAt,asc' }),
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
    this.reports.hasValue() ? this.reports.value().content.slice(0, 3) : [],
  );
}
