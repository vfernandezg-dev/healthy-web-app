import { DatePipe } from '@angular/common';
import { Component, inject, input, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCircleCheck, LucideCircleX } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { toProblem } from '@core/api/problem';
import { TIER_LABELS } from '@shared/i18n/labels';
import { StatusPanel } from '@shared/ui/status-panel';
import { BillingApi } from './data/billing-api';

/**
 * Vuelta desde PayPal tras aprobar el pago (/client/subscription/checkout/return?token={pedido}). Cobra el pedido y
 * muestra el resultado. La captura es idempotente: recargar la página no cobra dos veces.
 */
@Component({
  selector: 'app-checkout-return',
  imports: [DatePipe, RouterLink, ButtonDirective, ProgressSpinner, StatusPanel],
  templateUrl: './checkout-return.html',
})
export class CheckoutReturn {
  private readonly billing = inject(BillingApi);

  /** Id del pedido de PayPal (PayPal lo añade como ?token= a la URL de vuelta). */
  readonly token = input<string>();

  protected readonly tierLabels = TIER_LABELS;
  protected readonly confirmedIcon = LucideCircleCheck;
  protected readonly failedIcon = LucideCircleX;
  protected readonly capture = resource({
    params: () => this.token() || undefined,
    loader: ({ params: orderId }) => this.billing.capture(orderId),
  });

  protected failure(): string {
    return this.token()
      ? toProblem(this.capture.error()).detail
      : 'Falta el pedido de PayPal en la dirección. Vuelve a intentarlo desde tu suscripción.';
  }
}
