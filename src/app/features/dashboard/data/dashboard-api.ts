import { httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '../../../core/api/api-config';
import type {
  PagedModelContentSummaryResponse,
  PagedModelMealPlanSummaryResponse,
} from '../../../core/api/schema';

/** Lo que los paneles de inicio necesitan y no tiene ya otra funcionalidad. */
@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private readonly api = inject(APP_CONFIG).apiUrl;

  /** Planes del nutricionista (hasta 100, los últimos editados primero), para contarlos y ver los borradores. */
  ownPlans() {
    return httpResource<PagedModelMealPlanSummaryResponse>(() => ({
      url: `${this.api}/nutritionist/meal-plans`,
      params: { size: 100, sort: 'updatedAt,desc' },
    }));
  }

  /** Contenidos del nutricionista (hasta 100, los últimos editados primero). */
  ownContent() {
    return httpResource<PagedModelContentSummaryResponse>(() => ({
      url: `${this.api}/nutritionist/content-items`,
      params: { size: 100, sort: 'updatedAt,desc' },
    }));
  }
}
