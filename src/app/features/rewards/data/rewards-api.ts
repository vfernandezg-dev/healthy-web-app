import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '../../../core/api/api-config';
import { silentErrors } from '../../../core/api/http-context';
import type {
  PagedModelContentSummaryResponse,
  PagedModelMealPlanSummaryResponse,
  RewardRequest,
  RewardResponse,
} from '../../../core/api/schema';

/** Recompensas: rachas del cliente y gestión del nutricionista. */
@Injectable({ providedIn: 'root' })
export class RewardsApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).apiUrl;

  // ---------------------------------------------------------------- cliente

  /** Recompensas activas, cada una con la racha del cliente hacia ella (si la tiene). */
  catalog() {
    return httpResource<RewardResponse[]>(() => `${this.api}/rewards`);
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

  mine() {
    return httpResource<RewardResponse[]>(() => `${this.api}/nutritionist/rewards`);
  }

  /** Premios posibles: sus contenidos (se filtran los publicados). */
  ownContent() {
    return httpResource<PagedModelContentSummaryResponse>(() => ({
      url: `${this.api}/nutritionist/content-items`,
      params: { size: 100, sort: 'updatedAt,desc' },
    }));
  }

  /** Premios posibles: sus planes (se filtran los publicados). */
  ownMealPlans() {
    return httpResource<PagedModelMealPlanSummaryResponse>(() => ({
      url: `${this.api}/nutritionist/meal-plans`,
      params: { size: 100, sort: 'title,asc' },
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
