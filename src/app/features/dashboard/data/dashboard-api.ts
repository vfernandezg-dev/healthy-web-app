import { httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '@core/api/api-config';
import type {
  PagedModelContentSummaryResponse,
  PagedModelMealPlanSummaryResponse,
  PagedModelNutritionistClientResponse,
  PagedModelRewardResponse,
  PublicationSummaryResponse,
} from '@core/api/schema';

/** Borradores que enseña el panel de cada tipo (los últimos editados). */
export const DASHBOARD_DRAFTS = 5;
/** Clientes recientes que enseña el panel. */
export const DASHBOARD_CLIENTS = 4;

/** Lo que los paneles de inicio necesitan y no tiene ya otra funcionalidad. */
@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private readonly api = inject(APP_CONFIG).apiUrl;

  /** Cuántos planes tiene el nutricionista en cada estado. */
  planSummary() {
    return httpResource<PublicationSummaryResponse>(
      () => `${this.api}/nutritionist/meal-plans/summary`,
    );
  }

  /** Cuántos contenidos tiene el nutricionista en cada estado. */
  contentSummary() {
    return httpResource<PublicationSummaryResponse>(
      () => `${this.api}/nutritionist/content-items/summary`,
    );
  }

  /** Sus planes en borrador, los últimos editados primero. */
  draftPlans() {
    return httpResource<PagedModelMealPlanSummaryResponse>(() => ({
      url: `${this.api}/nutritionist/meal-plans`,
      params: { status: 'DRAFT', size: DASHBOARD_DRAFTS, sort: 'updatedAt,desc' },
    }));
  }

  /** Sus contenidos en borrador, los últimos editados primero. */
  draftContent() {
    return httpResource<PagedModelContentSummaryResponse>(() => ({
      url: `${this.api}/nutritionist/content-items`,
      params: { status: 'DRAFT', size: DASHBOARD_DRAFTS, sort: 'updatedAt,desc' },
    }));
  }

  /** Sus clientes más recientes (la API los ordena así) y, en `page.totalElements`, cuántos tiene. */
  recentClients() {
    return httpResource<PagedModelNutritionistClientResponse>(() => ({
      url: `${this.api}/nutritionist/clients`,
      params: { size: DASHBOARD_CLIENTS },
    }));
  }

  /** Solo para contar sus recompensas activas (`page.totalElements`). */
  activeRewards() {
    return httpResource<PagedModelRewardResponse>(() => ({
      url: `${this.api}/nutritionist/rewards`,
      params: { active: true, size: 1 },
    }));
  }
}
