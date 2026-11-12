import { DatePipe, formatDate } from '@angular/common';
import { Component, LOCALE_ID, computed, inject, signal } from '@angular/core';
import { LucideReceipt } from '@lucide/angular';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import type { PlanResponse } from '@core/api/schema';
import { ExternalNavigation, isPayPalUrl } from '@core/routing/external-navigation';
import { Confirmer } from '@core/ui/confirmer';
import { Toaster } from '@core/ui/toaster';
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_SEVERITY,
  TIER_LABELS,
  type Tier,
} from '@shared/i18n/labels';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { BillingApi } from './data/billing-api';

const TIER_ORDER: readonly Tier[] = ['BASIC', 'PREMIUM', 'VIP'];

/** Plan actual, planes disponibles (pago con PayPal) e historial de pagos del cliente. */
@Component({
  selector: 'app-subscription-page',
  imports: [
    DatePipe,
    MoneyPipe,
    ButtonDirective,
    ButtonLabel,
    Skeleton,
    Tag,
    EmptyState,
    LoadError,
    PageHeader,
  ],
  templateUrl: './subscription-page.html',
})
export class SubscriptionPage {
  private readonly billing = inject(BillingApi);
  private readonly navigation = inject(ExternalNavigation);
  private readonly confirmer = inject(Confirmer);
  private readonly toaster = inject(Toaster);
  private readonly locale = inject(LOCALE_ID);

  protected readonly plans = this.billing.plans();
  protected readonly current = this.billing.current();
  protected readonly payments = this.billing.payments();

  protected readonly tierLabels = TIER_LABELS;
  protected readonly paymentLabels = PAYMENT_STATUS_LABELS;
  protected readonly paymentSeverity = PAYMENT_STATUS_SEVERITY;
  protected readonly receiptIcon = LucideReceipt;

  protected readonly subscription = computed(() =>
    this.current.hasValue() ? this.current.value() : undefined,
  );
  protected readonly currentTier = computed<Tier>(() => this.subscription()?.tier ?? 'BASIC');
  /** Plan del que se está iniciando el pago (el botón queda cargando hasta salir hacia PayPal). */
  protected readonly checkingOut = signal<Tier | null>(null);
  protected readonly canceling = signal(false);

  protected isFree(plan: PlanResponse): boolean {
    return Number(plan.price.amount) === 0;
  }

  protected isUpgrade(tier: Tier): boolean {
    return TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(this.currentTier());
  }

  protected async subscribe(tier: Tier): Promise<void> {
    this.checkingOut.set(tier);
    try {
      const { approvalUrl } = await this.billing.checkout(tier);
      if (!isPayPalUrl(approvalUrl)) {
        this.toaster.error(
          'No se ha podido iniciar el pago',
          'La dirección de pago no es de PayPal.',
        );
        this.checkingOut.set(null);
        return;
      }
      this.navigation.assign(approvalUrl);
    } catch {
      // El interceptor de errores ya ha avisado.
      this.checkingOut.set(null);
    }
  }

  protected async cancel(): Promise<void> {
    const subscription = this.subscription();
    if (!subscription?.currentPeriodEnd) {
      return;
    }
    const tier = TIER_LABELS[subscription.tier];
    const until = formatDate(subscription.currentPeriodEnd, 'longDate', this.locale);
    const confirmed = await this.confirmer.ask({
      header: 'Cancelar la suscripción',
      message: `Mantendrás el acceso ${tier} hasta el ${until}. Después pasarás al plan Básico.`,
      acceptLabel: 'Cancelar la suscripción',
      rejectLabel: 'Mantenerla',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.canceling.set(true);
    try {
      this.current.value.set(await this.billing.cancel());
      this.toaster.success(
        'Suscripción cancelada',
        `Mantienes el acceso ${tier} hasta el ${until}.`,
      );
    } catch {
      // El interceptor de errores ya ha avisado.
    } finally {
      this.canceling.set(false);
    }
  }
}
