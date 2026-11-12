import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';

@Injectable({
  providedIn: 'root',
})
export class PasswordResetService {
  private readonly baseURL = `${inject(APP_CONFIG).apiUrl}/auth`;
  private readonly http = inject(HttpClient);

  /** Responde 202 exista o no la cuenta: la API no revela qué correos están registrados. */
  requestReset(correo: string): Observable<void> {
    return this.http.post<void>(`${this.baseURL}/forgot-password`, { correo });
  }

  /** Cambia la contraseña con el token del enlace. La API cierra todas las sesiones abiertas. */
  resetPassword(token: string, contrasena: string): Observable<void> {
    return this.http.post<void>(`${this.baseURL}/reset-password`, { token, contrasena });
  }
}

/**
 * Token del enlace del correo (`/auth/reset-password#token=…`). Va en el fragmento, que el navegador nunca envía
 * al servidor: no queda en logs ni en la cabecera Referer.
 */
export function tokenFromFragment(fragment: string | null): string | null {
  if (!fragment) {
    return null;
  }
  const token = new URLSearchParams(fragment).get('token');
  return token && /^[A-Za-z0-9_-]{20,128}$/.test(token) ? token : null;
}
