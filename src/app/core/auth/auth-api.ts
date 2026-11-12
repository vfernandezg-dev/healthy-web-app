import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '../api/api-config';
import { silentErrors } from '../api/http-context';
import type {
  AcceptInvitationRequest,
  InvitationPreviewResponse,
  LoginRequest,
  MeResponse,
  RegisterRequest,
  SessionResponse,
} from '../api/schema';

/**
 * `refresh` y `logout` viajan con la cookie del refresh token. La API exige esta cabecera (además de un Origin
 * permitido) como defensa CSRF: un formulario de otro sitio no puede añadirla.
 */
const COOKIE_REQUEST_HEADERS = new HttpHeaders({ 'X-Requested-With': 'XMLHttpRequest' });

/**
 * Peticiones de sesión y cuenta (/auth/**). Los errores no muestran avisos globales: cada formulario los enseña
 * junto a sus campos.
 */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(APP_CONFIG).apiUrl}/auth`;

  login(body: LoginRequest): Promise<SessionResponse> {
    return firstValueFrom(
      this.http.post<SessionResponse>(`${this.url}/login`, body, {
        withCredentials: true,
        context: silentErrors(),
      }),
    );
  }

  refresh(): Promise<SessionResponse> {
    return firstValueFrom(
      this.http.post<SessionResponse>(`${this.url}/refresh`, null, {
        withCredentials: true,
        headers: COOKIE_REQUEST_HEADERS,
        context: silentErrors(),
      }),
    );
  }

  logout(): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.url}/logout`, null, {
        withCredentials: true,
        headers: COOKIE_REQUEST_HEADERS,
        context: silentErrors(),
      }),
    );
  }

  register(body: RegisterRequest): Promise<MeResponse> {
    return firstValueFrom(
      this.http.post<MeResponse>(`${this.url}/register`, body, { context: silentErrors() }),
    );
  }

  previewInvitation(token: string): Promise<InvitationPreviewResponse> {
    return firstValueFrom(
      this.http.post<InvitationPreviewResponse>(
        `${this.url}/invitations/preview`,
        { token },
        { context: silentErrors() },
      ),
    );
  }

  acceptInvitation(body: AcceptInvitationRequest): Promise<MeResponse> {
    return firstValueFrom(
      this.http.post<MeResponse>(`${this.url}/invitations/accept`, body, {
        context: silentErrors(),
      }),
    );
  }

  /** Responde siempre igual, exista o no la cuenta (la API no revela qué correos están registrados). */
  forgotPassword(email: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.url}/forgot-password`, { email }, { context: silentErrors() }),
    );
  }

  resetPassword(token: string, password: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(
        `${this.url}/reset-password`,
        { token, password },
        { context: silentErrors() },
      ),
    );
  }
}
