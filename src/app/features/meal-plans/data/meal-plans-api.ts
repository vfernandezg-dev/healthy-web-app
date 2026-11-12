import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, type Signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '@core/api/api-config';
import { silentErrors } from '@core/api/http-context';
import type {
  EnrollmentResponse,
  MealPlanDetailResponse,
  MealPlanRequest,
  MealRequest,
  MealResponse,
  PagedModelMealPlanSummaryResponse,
} from '@core/api/schema';
import type { MealPlanGoal } from '@shared/i18n/labels';

export const CATALOG_PAGE_SIZE = 12;

/** Planes de alimentación: catálogo e inscripciones del cliente y gestión del nutricionista. */
@Injectable({ providedIn: 'root' })
export class MealPlansApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).apiUrl;

  // ---------------------------------------------------------------- cliente

  catalog(query: Signal<{ goal: MealPlanGoal | null; page: number }>) {
    return httpResource<PagedModelMealPlanSummaryResponse>(() => {
      const { goal, page } = query();
      return {
        url: `${this.api}/meal-plans`,
        params: {
          page,
          size: CATALOG_PAGE_SIZE,
          sort: 'publishedAt,desc',
          ...(goal ? { goal } : {}),
        },
      };
    });
  }

  /** 403 `subscription-required` (con `requiredTier`) si el plan está bloqueado para el cliente. */
  detail(id: Signal<string>) {
    return httpResource<MealPlanDetailResponse>(() => `${this.api}/meal-plans/${id()}`);
  }

  enrollments() {
    return httpResource<EnrollmentResponse[]>(() => `${this.api}/me/meal-plan-enrollments`);
  }

  enroll(mealPlanId: string): Promise<EnrollmentResponse> {
    return firstValueFrom(
      this.http.post<EnrollmentResponse>(`${this.api}/me/meal-plan-enrollments`, { mealPlanId }),
    );
  }

  unenroll(mealPlanId: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.api}/me/meal-plan-enrollments/${mealPlanId}`),
    );
  }

  // ---------------------------------------------------------------- nutricionista

  mine(page: Signal<number>) {
    return httpResource<PagedModelMealPlanSummaryResponse>(() => ({
      url: `${this.api}/nutritionist/meal-plans`,
      params: { page: page(), size: 20, sort: 'updatedAt,desc' },
    }));
  }

  /** El plan del nutricionista (cualquier estado), con sus comidas. */
  own(id: Signal<string>) {
    return httpResource<MealPlanDetailResponse>(
      () => `${this.api}/nutritionist/meal-plans/${id()}`,
    );
  }

  /** Los errores de campo se muestran en el formulario: sin aviso global. */
  create(body: MealPlanRequest): Promise<MealPlanDetailResponse> {
    return firstValueFrom(
      this.http.post<MealPlanDetailResponse>(`${this.api}/nutritionist/meal-plans`, body, {
        context: silentErrors(),
      }),
    );
  }

  update(id: string, body: MealPlanRequest): Promise<MealPlanDetailResponse> {
    return firstValueFrom(
      this.http.put<MealPlanDetailResponse>(`${this.api}/nutritionist/meal-plans/${id}`, body, {
        context: silentErrors(),
      }),
    );
  }

  publish(id: string): Promise<MealPlanDetailResponse> {
    return firstValueFrom(
      this.http.post<MealPlanDetailResponse>(
        `${this.api}/nutritionist/meal-plans/${id}/publish`,
        null,
      ),
    );
  }

  archive(id: string): Promise<MealPlanDetailResponse> {
    return firstValueFrom(
      this.http.post<MealPlanDetailResponse>(
        `${this.api}/nutritionist/meal-plans/${id}/archive`,
        null,
      ),
    );
  }

  /** Solo los borradores (409 `plan-not-draft`). */
  delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.api}/nutritionist/meal-plans/${id}`));
  }

  addMeal(planId: string, body: MealRequest): Promise<MealResponse> {
    return firstValueFrom(
      this.http.post<MealResponse>(`${this.api}/nutritionist/meal-plans/${planId}/meals`, body, {
        context: silentErrors(),
      }),
    );
  }

  updateMeal(planId: string, mealId: string, body: MealRequest): Promise<MealResponse> {
    return firstValueFrom(
      this.http.put<MealResponse>(
        `${this.api}/nutritionist/meal-plans/${planId}/meals/${mealId}`,
        body,
        { context: silentErrors() },
      ),
    );
  }

  deleteMeal(planId: string, mealId: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.api}/nutritionist/meal-plans/${planId}/meals/${mealId}`),
    );
  }
}
