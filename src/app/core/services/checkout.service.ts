import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { APP_CONFIG } from '../config/app-config';
import {
  PaypalCaptureResponse,
  PaypalOrderResponse,
} from '../../shared/models/paypal-response.model';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private readonly baseURL = `${inject(APP_CONFIG).apiUrl}/checkout`;
  private readonly http = inject(HttpClient);

  /** Las URLs de vuelta de PayPal las decide la API (APP_FRONTEND_URL), no el navegador. */
  createPaypalOrder(suscripcionId: number) {
    return this.http.post<PaypalOrderResponse>(`${this.baseURL}/create`, null, {
      params: { suscripcionId },
    });
  }

  capturePaypalOrder(orderId: string) {
    return this.http.post<PaypalCaptureResponse>(`${this.baseURL}/capture`, null, {
      params: { orderId },
    });
  }
}

/** Solo se redirige a PayPal por HTTPS: si la respuesta trajera otro destino, no se sigue. */
export function isPayPalUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' && (hostname === 'paypal.com' || hostname.endsWith('.paypal.com'));
  } catch {
    return false;
  }
}
