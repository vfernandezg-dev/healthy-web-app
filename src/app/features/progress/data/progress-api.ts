import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, type Signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '@core/api/api-config';
import { silentErrors } from '@core/api/http-context';
import type {
  GoalRequest,
  GoalResponse,
  RecommendationResponse,
  WeightEntryRequest,
  WeightEntryResponse,
} from '@core/api/schema';

/** Metas de peso del cliente, sus pesajes y la recomendación de peso saludable. */
@Injectable({ providedIn: 'root' })
export class ProgressApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(APP_CONFIG).apiUrl}/me/goals`;

  /** Todas las metas (la activa y las cerradas). */
  goals() {
    return httpResource<GoalResponse[]>(() => this.url);
  }

  /** Todos los pesajes de la meta, del más antiguo al último. Sin meta, no pide nada. */
  entries(goalId: Signal<string | undefined>) {
    return httpResource<WeightEntryResponse[]>(() => {
      const id = goalId();
      return id ? `${this.url}/${id}/weight-entries` : undefined;
    });
  }

  /** 409 `profile-incomplete` si el perfil no tiene la altura. */
  recommendation(goalId: Signal<string | undefined>) {
    return httpResource<RecommendationResponse>(() => {
      const id = goalId();
      return id ? `${this.url}/${id}/recommendation` : undefined;
    });
  }

  create(body: GoalRequest): Promise<GoalResponse> {
    return firstValueFrom(
      this.http.post<GoalResponse>(this.url, body, { context: silentErrors() }),
    );
  }

  update(id: string, body: GoalRequest): Promise<GoalResponse> {
    return firstValueFrom(
      this.http.put<GoalResponse>(`${this.url}/${id}`, body, { context: silentErrors() }),
    );
  }

  complete(id: string): Promise<GoalResponse> {
    return firstValueFrom(this.http.post<GoalResponse>(`${this.url}/${id}/complete`, null));
  }

  abandon(id: string): Promise<GoalResponse> {
    return firstValueFrom(this.http.post<GoalResponse>(`${this.url}/${id}/abandon`, null));
  }

  addEntry(goalId: string, body: WeightEntryRequest): Promise<WeightEntryResponse> {
    return firstValueFrom(
      this.http.post<WeightEntryResponse>(`${this.url}/${goalId}/weight-entries`, body, {
        context: silentErrors(),
      }),
    );
  }

  updateEntry(
    goalId: string,
    entryId: string,
    body: WeightEntryRequest,
  ): Promise<WeightEntryResponse> {
    return firstValueFrom(
      this.http.put<WeightEntryResponse>(`${this.url}/${goalId}/weight-entries/${entryId}`, body, {
        context: silentErrors(),
      }),
    );
  }

  deleteEntry(goalId: string, entryId: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.url}/${goalId}/weight-entries/${entryId}`),
    );
  }
}
