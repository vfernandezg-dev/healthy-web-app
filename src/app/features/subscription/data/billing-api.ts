import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '@core/api/api-config';
import { silentErrors } from '@core/api/http-context';
import type {
  CheckoutResponse,
  CurrentSubscriptionResponse,
  PagedModelPaymentResponse,
  PlanResponse,
} from '@core/api/schema';
import type { Tier } from '@shared/i18n/labels';

/** Planes, suscripción del usuario y pagos (crear los recursos en el contexto de inyección del componente). */
@Injectable({ providedIn: 'root' })
export class BillingApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).apiUrl;

  plans() {
    return httpResource<PlanResponse[]>(() => `${this.api}/subscription-plans`);
  }

  current() {
    return httpResource<CurrentSubscriptionResponse>(() => `${this.api}/me/subscription`);
  }

  payments() {
    return httpResource<PagedModelPaymentResponse>(() => ({
      url: `${this.api}/me/payments`,
      params: { size: 10, sort: 'createdAt,desc' },
    }));
  }

  /** Crea el pedido en PayPal y devuelve la URL donde el usuario lo aprueba. */
  checkout(tier: Tier): Promise<CheckoutResponse> {
    return firstValueFrom(
      this.http.post<CheckoutResponse>(`${this.api}/me/subscription/checkout`, { tier }),
    );
  }

  /** Cobra el pedido aprobado. Idempotente: repetirlo no cobra dos veces. */
  capture(orderId: string): Promise<CurrentSubscriptionResponse> {
    return firstValueFrom(
      this.http.post<CurrentSubscriptionResponse>(
        `${this.api}/me/subscription/checkout/capture`,
        { orderId },
        { context: silentErrors() },
      ),
    );
  }

  cancel(): Promise<CurrentSubscriptionResponse> {
    return firstValueFrom(
      this.http.post<CurrentSubscriptionResponse>(`${this.api}/me/subscription/cancel`, null),
    );
  }
}
