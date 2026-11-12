import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '../../../core/api/api-config';
import { silentErrors } from '../../../core/api/http-context';
import type {
  ChangePasswordRequest,
  MeResponse,
  SessionResponse,
  UpdateProfileRequest,
} from '../../../core/api/schema';

/** La cuenta del usuario actual (/me). */
@Injectable({ providedIn: 'root' })
export class ProfileApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(APP_CONFIG).apiUrl}/me`;

  /** Datos de la cuenta y del perfil de su rol. Crear en el contexto de inyección del componente. */
  me() {
    return httpResource<MeResponse>(() => this.url);
  }

  /** Los errores de campo se muestran en el formulario: sin aviso global. */
  update(body: UpdateProfileRequest): Promise<MeResponse> {
    return firstValueFrom(
      this.http.put<MeResponse>(`${this.url}/profile`, body, { context: silentErrors() }),
    );
  }

  /** Devuelve una sesión nueva: las demás quedan cerradas. */
  changePassword(body: ChangePasswordRequest): Promise<SessionResponse> {
    return firstValueFrom(
      this.http.put<SessionResponse>(`${this.url}/password`, body, { context: silentErrors() }),
    );
  }
}
