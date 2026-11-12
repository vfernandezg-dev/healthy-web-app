import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCircleSlash } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';

/** Vuelta desde PayPal cuando el usuario cancela el pago. No se ha cobrado nada. */
@Component({
  selector: 'app-checkout-cancel',
  imports: [RouterLink, ButtonDirective, LucideCircleSlash],
  template: `
    <div class="card mx-auto mt-6 max-w-xl px-6 py-12 text-center sm:px-12">
      <span class="mx-auto grid size-14 place-items-center rounded-full bg-brand-50 text-brand-700">
        <svg lucideCircleSlash class="size-8"></svg>
      </span>
      <h1 class="mt-6 text-2xl font-bold">Has cancelado el pago</h1>
      <p class="mt-2 text-muted">
        No se te ha cobrado nada y sigues con tu plan actual. Puedes suscribirte cuando quieras.
      </p>
      <a pButton routerLink="/client/subscription" class="mt-8"> Volver a la suscripción </a>
    </div>
  `,
})
export class CheckoutCancel {}
