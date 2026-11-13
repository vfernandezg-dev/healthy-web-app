import { DatePipe, formatDate } from '@angular/common';
import { Component, LOCALE_ID, computed, inject, signal } from '@angular/core';
import { LucideReceipt } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import type { PlanResponse, CurrentSubscriptionResponse } from '@core/api/schema';
import { ExternalNavigation } from '@core/routing/external-navigation';
import { Toaster } from '@core/ui/toaster';
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
  TIER_LABELS,
  type Tier,
} from '@shared/i18n/labels';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { BillingApi } from './data/billing-api';
import { mutation } from '@shared/utils/mutation';
import { Badge } from '@shared/ui/badge';

const TIER_ORDER: readonly Tier[] = ['BASIC', 'PREMIUM', 'VIP'];

/** Plan actual, planes disponibles (pago con PayPal) e historial de pagos del cliente. */
@Component({
  selector: 'app-subscription-page',
  imports: [
    DatePipe,
    MoneyPipe,
    ButtonDirective,
    Skeleton,
    Badge,
    EmptyState,
    LoadError,
    PageHeader,
  ],
  templateUrl: './subscription-page.html',
})
export class SubscriptionPage {
  private readonly billing = inject(BillingApi);
  private readonly navigation = inject(ExternalNavigation);
  private readonly toaster = inject(Toaster);
  private readonly locale = inject(LOCALE_ID);

  protected readonly plans = this.billing.plans();
  protected readonly current = this.billing.current();
  protected readonly payments = this.billing.payments();

  protected readonly tierLabels = TIER_LABELS;
  protected readonly paymentLabels = PAYMENT_STATUS_LABELS;
  protected readonly paymentTones = PAYMENT_STATUS_TONE;
  protected readonly receiptIcon = LucideReceipt;

  protected readonly subscription = computed(() =>
    this.current.hasValue() ? this.current.value() : undefined,
  );
  protected readonly currentTier = computed<Tier>(() => this.subscription()?.tier ?? 'BASIC');
  /**
   * Plan del que se está iniciando el pago. No es un mutation(): el botón sigue cargando hasta que el navegador sale
   * hacia PayPal (y solo vuelve a su estado si el pago no llega a empezar).
   */
  protected readonly checkingOut = signal<Tier | null>(null);

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
      if (!this.navigation.toPayPal(approvalUrl)) {
        this.toaster.error(
          'No se ha podido iniciar el pago',
          'La dirección de pago no es de PayPal.',
        );
        this.checkingOut.set(null);
      }
    } catch {
      // El interceptor de errores ya ha avisado.
      this.checkingOut.set(null);
    }
  }

  protected readonly cancel = mutation(
    (_subscription: CurrentSubscriptionResponse) => this.billing.cancel(),
    {
      confirm: (subscription) => ({
        header: 'Cancelar la suscripción',
        message: `Mantendrás el acceso ${this.accessUntil(subscription)}. Después pasarás al plan Básico.`,
        acceptLabel: 'Cancelar la suscripción',
        rejectLabel: 'Mantenerla',
        danger: true,
      }),
      success: (_, subscription) => ({
        summary: 'Suscripción cancelada',
        detail: `Mantienes el acceso ${this.accessUntil(subscription)}.`,
      }),
      onSuccess: (updated) => this.current.value.set(updated),
    },
  );

  /** «Premium hasta el 12 de diciembre de 2026». */
  private accessUntil(subscription: CurrentSubscriptionResponse): string {
    const until = subscription.currentPeriodEnd
      ? formatDate(subscription.currentPeriodEnd, 'longDate', this.locale)
      : '';
    return `${TIER_LABELS[subscription.tier]} hasta el ${until}`;
  }
}
