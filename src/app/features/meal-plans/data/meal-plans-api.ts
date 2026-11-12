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
  PublicationSummaryResponse,
} from '@core/api/schema';
import type { MealPlanGoal, PublicationStatus } from '@shared/i18n/labels';
import { type PageRequest, pageParams } from '@shared/table/page-query';

export interface CatalogFilters {
  readonly goal: MealPlanGoal | null;
}

/** Planes del nutricionista: todos, o solo los de un estado. */
export interface OwnPlanFilters {
  readonly status: PublicationStatus | null;
}

/** Planes de alimentación: catálogo e inscripciones del cliente y gestión del nutricionista. */
@Injectable({ providedIn: 'root' })
export class MealPlansApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).apiUrl;

  // ---------------------------------------------------------------- cliente

  catalog(request: Signal<CatalogFilters & PageRequest>) {
    return httpResource<PagedModelMealPlanSummaryResponse>(() => {
      const { goal, ...page } = request();
      return { url: `${this.api}/meal-plans`, params: pageParams(page, { goal }) };
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

  /** Sus planes (en todos los estados, o en uno). Lo usan también el panel y el diálogo de recompensas. */
  mine(request: Signal<OwnPlanFilters & PageRequest>) {
    return httpResource<PagedModelMealPlanSummaryResponse>(() => {
      const { status, ...page } = request();
      return { url: `${this.api}/nutritionist/meal-plans`, params: pageParams(page, { status }) };
    });
  }

  /** Cuántos planes tiene en cada estado. */
  summary() {
    return httpResource<PublicationSummaryResponse>(
      () => `${this.api}/nutritionist/meal-plans/summary`,
    );
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
