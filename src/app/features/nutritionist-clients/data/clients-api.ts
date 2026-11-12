import { httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '../../../core/api/api-config';
import type { NutritionistClientResponse } from '../../../core/api/schema';

/** Clientes del nutricionista: quienes siguen alguno de sus planes. */
@Injectable({ providedIn: 'root' })
export class ClientsApi {
  private readonly api = inject(APP_CONFIG).apiUrl;

  clients() {
    return httpResource<NutritionistClientResponse[]>(() => `${this.api}/nutritionist/clients`);
  }
}
