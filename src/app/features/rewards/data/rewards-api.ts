import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, type Signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '@core/api/api-config';
import { silentErrors } from '@core/api/http-context';
import type {
  PagedModelContentSummaryResponse,
  PagedModelMealPlanSummaryResponse,
  PagedModelRewardResponse,
  RewardRequest,
  RewardResponse,
} from '@core/api/schema';

export const REWARD_PAGE_SIZE = 12;

/** Recompensas: rachas del cliente y gestión del nutricionista. */
@Injectable({ providedIn: 'root' })
export class RewardsApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).apiUrl;

  // ---------------------------------------------------------------- cliente

  /** Recompensas activas, de la más corta a la más larga, cada una con la racha del cliente hacia ella (si la tiene). */
  catalog(page: Signal<number>) {
    return httpResource<PagedModelRewardResponse>(() => ({
      url: `${this.api}/rewards`,
      params: { page: page(), size: REWARD_PAGE_SIZE, sort: 'requiredStreakDays,asc' },
    }));
  }

  /** Todas las rachas del cliente (también las completadas de recompensas ya retiradas). */
  streaks() {
    return httpResource<RewardResponse[]>(() => `${this.api}/me/streaks`);
  }

  /** 409 `streak-exists` si ya tiene una racha hacia esa recompensa. */
  start(rewardId: string): Promise<RewardResponse> {
    return firstValueFrom(this.http.post<RewardResponse>(`${this.api}/me/streaks`, { rewardId }));
  }

  /** 409 `streak-completed` si ya está completada. */
  abandon(streakId: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.api}/me/streaks/${streakId}`));
  }

  // ---------------------------------------------------------------- nutricionista

  /** Sus recompensas (activas y retiradas), las últimas creadas primero. */
  mine(page: Signal<number>) {
    return httpResource<PagedModelRewardResponse>(() => ({
      url: `${this.api}/nutritionist/rewards`,
      params: { page: page(), size: REWARD_PAGE_SIZE, sort: 'createdAt,desc' },
    }));
  }

  /** Premios posibles: sus contenidos publicados (hasta 100, la página más grande de la API). */
  ownContent() {
    return httpResource<PagedModelContentSummaryResponse>(() => ({
      url: `${this.api}/nutritionist/content-items`,
      params: { status: 'PUBLISHED', size: 100, sort: 'updatedAt,desc' },
    }));
  }

  /** Premios posibles: sus planes publicados (hasta 100). */
  ownMealPlans() {
    return httpResource<PagedModelMealPlanSummaryResponse>(() => ({
      url: `${this.api}/nutritionist/meal-plans`,
      params: { status: 'PUBLISHED', size: 100, sort: 'title,asc' },
    }));
  }

  create(body: RewardRequest): Promise<RewardResponse> {
    return firstValueFrom(
      this.http.post<RewardResponse>(`${this.api}/nutritionist/rewards`, body, {
        context: silentErrors(),
      }),
    );
  }

  update(id: string, body: RewardRequest): Promise<RewardResponse> {
    return firstValueFrom(
      this.http.put<RewardResponse>(`${this.api}/nutritionist/rewards/${id}`, body, {
        context: silentErrors(),
      }),
    );
  }

  /** Deja de ofrecerla; las rachas completadas conservan su premio. */
  deactivate(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.api}/nutritionist/rewards/${id}`));
  }
}
