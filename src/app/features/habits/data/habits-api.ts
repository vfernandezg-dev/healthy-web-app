import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, type Signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '../../../core/api/api-config';
import { silentErrors } from '../../../core/api/http-context';
import type { HabitLogRequest, HabitLogResponse } from '../../../core/api/schema';

/** Registros diarios de hábitos (cuentan para las rachas de las recompensas). */
@Injectable({ providedIn: 'root' })
export class HabitsApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(APP_CONFIG).apiUrl}/me/habit-logs`;

  /** Registros entre dos fechas (`YYYY-MM-DD`, ambas incluidas). */
  logs(range: Signal<{ from: string; to: string }>) {
    return httpResource<HabitLogResponse[]>(() => ({ url: this.url, params: { ...range() } }));
  }

  /** Solo hoy o ayer (422 si no). 409 `habit-log-exists` si ese día ya tiene registro. */
  create(body: HabitLogRequest): Promise<HabitLogResponse> {
    return firstValueFrom(
      this.http.post<HabitLogResponse>(this.url, body, { context: silentErrors() }),
    );
  }

  update(id: string, body: HabitLogRequest): Promise<HabitLogResponse> {
    return firstValueFrom(
      this.http.put<HabitLogResponse>(`${this.url}/${id}`, body, { context: silentErrors() }),
    );
  }

  delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }
}
