import { DatePipe } from '@angular/common';
import { Component, inject, input, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCircleCheck, LucideCircleX } from '@lucide/angular';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { toProblem } from '../../core/api/problem';
import { TIER_LABELS } from '../../shared/i18n/labels';
import { BillingApi } from './data/billing-api';

/**
 * Vuelta desde PayPal tras aprobar el pago (/client/subscription/checkout/return?token={pedido}). Cobra el pedido y
 * muestra el resultado. La captura es idempotente: recargar la página no cobra dos veces.
 */
@Component({
  selector: 'app-checkout-return',
  imports: [
    DatePipe,
    RouterLink,
    ButtonDirective,
    ButtonLabel,
    ProgressSpinner,
    LucideCircleCheck,
    LucideCircleX,
  ],
  template: `
    <div class="card mx-auto mt-6 max-w-xl px-6 py-12 text-center sm:px-12">
      @if (capture.isLoading()) {
        <div role="status" aria-live="polite">
          <p-progressspinner
            styleClass="size-12!"
            strokeWidth="4"
            ariaLabel="Confirmando el pago"
          />
          <h1 class="mt-6 text-2xl font-bold">Confirmando tu pago…</h1>
          <p class="mt-2 text-muted">No cierres esta página, solo tarda unos segundos.</p>
        </div>
      } @else if (capture.hasValue()) {
        @let subscription = capture.value();
        <span
          class="mx-auto grid size-14 place-items-center rounded-full bg-brand-50 text-brand-700"
        >
          <svg lucideCircleCheck class="size-8"></svg>
        </span>
        <h1 class="mt-6 text-2xl font-bold">¡Ya tienes {{ tierLabels[subscription.tier] }}!</h1>
        <p class="mt-2 text-muted">
          Hemos recibido tu pago. Tienes acceso hasta el
          {{ subscription.currentPeriodEnd | date: 'longDate' }}. Te hemos enviado el justificante
          por correo.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <a pButton routerLink="/client/content"><span pButtonLabel>Ver el contenido</span></a>
          <a pButton routerLink="/client/subscription" severity="secondary" variant="outlined">
            <span pButtonLabel>Ver mi suscripción</span>
          </a>
        </div>
      } @else {
        <span class="mx-auto grid size-14 place-items-center rounded-full bg-red-50 text-red-700">
          <svg lucideCircleX class="size-8"></svg>
        </span>
        <h1 class="mt-6 text-2xl font-bold">No se ha podido completar el pago</h1>
        <p class="mt-2 text-muted">{{ failure() }}</p>
        <a pButton routerLink="/client/subscription" severity="secondary" class="mt-8">
          <span pButtonLabel>Volver a la suscripción</span>
        </a>
      }
    </div>
  `,
})
export class CheckoutReturn {
  private readonly billing = inject(BillingApi);

  /** Id del pedido de PayPal (PayPal lo añade como ?token= a la URL de vuelta). */
  readonly token = input<string>();

  protected readonly tierLabels = TIER_LABELS;
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
