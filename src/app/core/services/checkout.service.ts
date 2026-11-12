import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { APP_CONFIG } from '../config/app-config';
import {
  PaypalCaptureResponse,
  PaypalOrderResponse,
} from '../../shared/models/paypal-response.model';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private baseURL = `${inject(APP_CONFIG).apiUrl}/checkout`;
  // PayPal devuelve al usuario al mismo origen que sirve la app (en la fase de seguridad pasa al servidor).
  private readonly paypalReturnUrl = `${window.location.origin}/cliente/perfil`;

  private http = inject(HttpClient);

  createPaypalOrder(suscripcionId: number) {
    let params = new HttpParams();
    params = params.append('suscripcionId', suscripcionId);
    params = params.append('returnUrl', this.paypalReturnUrl);
    params = params.append('cancelUrl', this.paypalReturnUrl);
    return this.http.post<PaypalOrderResponse>(`${this.baseURL}/create`, null, {
      params: params,
    });
  }

  capturePaypalOrder(orderId: string) {
    return this.http.post<PaypalCaptureResponse>(
      `${this.baseURL}/capture?orderId=${orderId}`,
      null
    );
  }
}
