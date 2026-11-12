import { httpResource } from '@angular/common/http';
import { Injectable, type Signal, inject } from '@angular/core';
import { APP_CONFIG } from '@core/api/api-config';
import type { PagedModelNutritionistClientResponse } from '@core/api/schema';
import { type PageRequest } from '@shared/table/page-query';

export interface ClientFilters {
  /** Busca por nombre, apellidos o correo (en la API, sin distinguir mayúsculas ni tildes). */
  readonly q: string;
}

/** Clientes del nutricionista: quienes siguen alguno de sus planes. */
@Injectable({ providedIn: 'root' })
export class ClientsApi {
  private readonly api = inject(APP_CONFIG).apiUrl;

  /** Los más recientes primero: la API no admite otro orden (no se envía `sort`). */
  clients(request: Signal<ClientFilters & Omit<PageRequest, 'sort'>>) {
    return httpResource<PagedModelNutritionistClientResponse>(() => {
      const { q, page, size } = request();
      return {
        url: `${this.api}/nutritionist/clients`,
        params: { page, size, ...(q.trim() ? { q: q.trim() } : {}) },
      };
    });
  }
}
