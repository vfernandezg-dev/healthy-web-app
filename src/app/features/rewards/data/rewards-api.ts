import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, type Signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '@core/api/api-config';
import { silentErrors } from '@core/api/http-context';
import type { PagedModelRewardResponse, RewardRequest, RewardResponse } from '@core/api/schema';
import { type PageRequest, pageParams } from '@shared/table/page-query';

/** Recompensas del nutricionista: todas, o solo las activas o las retiradas. */
export interface OwnRewardFilters {
  readonly active: boolean | null;
}

/** Recompensas: rachas del cliente y gestión del nutricionista. */
@Injectable({ providedIn: 'root' })
export class RewardsApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).apiUrl;

  // ---------------------------------------------------------------- cliente

  /** Recompensas activas, de la más corta a la más larga, cada una con la racha del cliente hacia ella (si la tiene). */
  catalog(request: Signal<PageRequest>) {
    return httpResource<PagedModelRewardResponse>(() => ({
      url: `${this.api}/rewards`,
      params: pageParams(request()),
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
  mine(request: Signal<OwnRewardFilters & PageRequest>) {
    return httpResource<PagedModelRewardResponse>(() => {
      const { active, ...page } = request();
      return { url: `${this.api}/nutritionist/rewards`, params: pageParams(page, { active }) };
    });
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
