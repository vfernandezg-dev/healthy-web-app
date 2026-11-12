import { DOCUMENT, Injectable, inject } from '@angular/core';

/** Sale de la app hacia otra web (por ejemplo, la página de pago de PayPal). Aislado para poder simularlo. */
@Injectable({ providedIn: 'root' })
export class ExternalNavigation {
  private readonly document = inject(DOCUMENT);

  assign(url: string): void {
    this.document.location.assign(url);
  }
}

/**
 * ¿Es una página de PayPal? La URL de aprobación la genera la API, pero antes de mandar al usuario a pagar se
 * comprueba que va a PayPal por HTTPS y no a otro sitio.
 */
export function isPayPalUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' && (hostname === 'paypal.com' || hostname.endsWith('.paypal.com'));
  } catch {
    return false;
  }
}
