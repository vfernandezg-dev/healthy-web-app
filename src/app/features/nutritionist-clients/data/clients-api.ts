import { httpResource } from '@angular/common/http';
import { Injectable, type Signal, inject } from '@angular/core';
import { APP_CONFIG } from '@core/api/api-config';
import type { PagedModelNutritionistClientResponse } from '@core/api/schema';

export const CLIENTS_PAGE_SIZE = 20;

export interface ClientsQuery {
  /** Busca por nombre, apellidos o correo (en la API, sin distinguir mayúsculas ni tildes). */
  readonly q: string;
  readonly page: number;
}

/** Clientes del nutricionista: quienes siguen alguno de sus planes. */
@Injectable({ providedIn: 'root' })
export class ClientsApi {
  private readonly api = inject(APP_CONFIG).apiUrl;

  /** Los más recientes primero: la API no admite otro orden (no se envía `sort`). */
  clients(query: Signal<ClientsQuery>) {
    return httpResource<PagedModelNutritionistClientResponse>(() => {
      const { q, page } = query();
      return {
        url: `${this.api}/nutritionist/clients`,
        params: { page, size: CLIENTS_PAGE_SIZE, ...(q.trim() ? { q: q.trim() } : {}) },
      };
    });
  }
}
