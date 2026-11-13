import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCircleSlash } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { StatusPanel } from '@shared/ui/status-panel';

/** Vuelta desde PayPal cuando el usuario cancela el pago. No se ha cobrado nada. */
@Component({
  selector: 'app-checkout-cancel',
  imports: [RouterLink, ButtonDirective, StatusPanel],
  template: `
    <app-status-panel eyebrow="Pago con PayPal" heading="Has cancelado el pago" [icon]="icon">
      <p>
        No se te ha cobrado nada y sigues con tu plan actual. Puedes suscribirte cuando quieras.
      </p>
      <a actions pButton routerLink="/client/subscription">Volver a la suscripción</a>
    </app-status-panel>
  `,
})
export class CheckoutCancel {
  protected readonly icon = LucideCircleSlash;
}
