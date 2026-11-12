import { DOCUMENT, Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '../api/api-config';

/**
 * Sale de la app hacia otra web. Cada salida valida su destino aquí, no en quien la llama: una URL que venga de la
 * API no puede llevar al usuario a un sitio cualquiera. Aislado también para poder simularlo en los tests.
 */
@Injectable({ providedIn: 'root' })
export class ExternalNavigation {
  private readonly document = inject(DOCUMENT);
  private readonly apiUrl = inject(APP_CONFIG).apiUrl;

  /** Lleva a la página de pago de PayPal. Si la URL no es de PayPal por HTTPS, no navega y devuelve false. */
  toPayPal(url: string): boolean {
    if (!isPayPalUrl(url)) {
      return false;
    }
    this.document.location.assign(url);
    return true;
  }

  /**
   * Abre una pestaña nueva ya (dentro del clic, para que el navegador no la bloquee) y devuelve cómo llevarla a un
   * fichero de la API cuando se conozca su ruta (por ejemplo, tras pedir un enlace firmado). Sin `opener`: la página
   * abierta no puede tocar esta.
   */
  openApiTab(): PendingTab {
    const tab = this.document.defaultView?.open('about:blank', '_blank') ?? null;
    if (tab) {
      tab.opener = null;
    }
    return {
      go: (path) => {
        const url = this.apiUrlOf(path);
        if (!url) {
          tab?.close();
          return false;
        }
        (tab ?? this.document.defaultView)?.location.assign(url);
        return true;
      },
      cancel: () => tab?.close(),
    };
  }

  /** URL absoluta de una ruta de la API que envía la propia API (un enlace firmado), o null si sale de la API. */
  apiUrlOf(path: string): string | null {
    return apiUrlFor(this.apiUrl, path, this.document.baseURI);
  }
}

export interface PendingTab {
  /** Lleva la pestaña a `path` (una ruta de la API). Si la ruta sale de la API, la cierra y devuelve false. */
  go(path: string): boolean;
  cancel(): void;
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

/**
 * URL absoluta de una ruta de la API (`/media/…`), o null si la ruta no es interna o se sale de la API (`//otro`,
 * `https://…`, `/../`, barras invertidas).
 */
export function apiUrlFor(apiUrl: string, path: string, baseUri: string): string | null {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return null;
  }
  try {
    const root = new URL(`${apiUrl}/`, baseUri);
    const url = new URL(`${apiUrl}${path}`, baseUri);
    return url.origin === root.origin && url.pathname.startsWith(root.pathname) ? url.href : null;
  } catch {
    return null;
  }
}
