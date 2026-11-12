import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { AuthRequest } from '../../shared/models/auth-request.model';
import { AuthResponse } from '../../shared/models/auth-response.model';
import { RegisterRequest } from '../../shared/models/register-request.model';
import { RegisterResponse } from '../../shared/models/register-response.mode';
import { homeFor } from '../guards/role-home';

/** Endpoints de sesión: viajan con la cookie del refresh token y nunca llevan el access token. */
export const SESSION_HEADERS = new HttpHeaders({ 'X-Requested-With': 'XMLHttpRequest' });

/** Claves que guardaba la versión anterior en localStorage; se borran al arrancar. */
const LEGACY_STORAGE_KEYS = ['healthybites_auth', 'resetToken'];
const REFRESH_LOCK = 'healthybites-refresh';
const LOGOUT_MESSAGE = 'logout';

/**
 * Sesión del usuario.
 *
 * - El access token (JWT de 15 minutos) vive solo en memoria: no está en localStorage, así que un XSS no puede
 *   robarlo para usarlo después.
 * - El refresh token está en una cookie httpOnly que el navegador envía solo a /auth/refresh y /auth/logout.
 *   Al arrancar (y tras un 401) se pide un access token nuevo con ella.
 * - Un único refresh a la vez, también entre pestañas (Web Locks): el servidor rota el refresh token en cada uso.
 * - El logout se propaga al resto de pestañas (BroadcastChannel).
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authUrl = `${inject(APP_CONFIG).apiUrl}/auth`;

  private readonly session = signal<AuthResponse | null>(null);
  readonly user = this.session.asReadonly();
  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly role = computed(() => this.session()?.role ?? null);

  private refreshInFlight: Promise<boolean> | null = null;
  private readonly channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('healthybites-auth');

  constructor() {
    LEGACY_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    this.channel?.addEventListener('message', event => {
      if (event.data === LOGOUT_MESSAGE) {
        this.session.set(null);
        void this.router.navigateByUrl('/auth/login');
      }
    });
  }

  login(authRequest: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, authRequest, { withCredentials: true })
      .pipe(tap(response => this.session.set(response)));
  }

  register(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.authUrl}/register/cliente`, registerRequest);
  }

  /**
   * Pide un access token nuevo con la cookie del refresh token. Nunca falla: devuelve false si no hay sesión.
   * Las llamadas simultáneas comparten la misma petición.
   */
  refresh(): Promise<boolean> {
    this.refreshInFlight ??= this.withRefreshLock(() => this.requestRefresh())
      .finally(() => this.refreshInFlight = null);
    return this.refreshInFlight;
  }

  /** Cierra la sesión en el servidor, en esta pestaña y en las demás. */
  logout(): void {
    this.session.set(null);
    this.http.post(`${this.authUrl}/logout`, null, { withCredentials: true, headers: SESSION_HEADERS })
      .subscribe({ error: () => undefined });
    this.channel?.postMessage(LOGOUT_MESSAGE);
    void this.router.navigateByUrl('/auth/login');
  }

  /** La sesión caducó (el refresh también falló): vuelta al login, recordando dónde estaba el usuario. */
  expireSession(): void {
    this.session.set(null);
    const returnUrl = this.router.url;
    void this.router.navigate(['/auth/login'], {
      queryParams: returnUrl && !returnUrl.startsWith('/auth') ? { returnUrl } : undefined,
    });
  }

  accessToken(): string | null {
    return this.session()?.accessToken ?? null;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  getUser(): AuthResponse | null {
    return this.session();
  }

  getNutricionistaId(): number {
    return Number(this.session()?.nutricionistaId ?? 0);
  }

  getClienteId(): number {
    return Number(this.session()?.clienteId ?? 0);
  }

  getUserRole(): string | null {
    return this.role();
  }

  /** Página de inicio del usuario actual según su rol. */
  homeUrl(): string {
    return homeFor(this.role());
  }

  /** Refleja en la sesión los cambios de nombre hechos en el perfil. */
  updateName(nombre: string, apellido: string): void {
    this.session.update(current => current && { ...current, nombre, apellido });
  }

  private async requestRefresh(): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.http.post<AuthResponse>(`${this.authUrl}/refresh`, null,
        { withCredentials: true, headers: SESSION_HEADERS }));
      this.session.set(response);
      return true;
    } catch {
      this.session.set(null);
      return false;
    }
  }

  private withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
    const locks = typeof navigator === 'undefined' ? undefined : navigator.locks;
    return locks ? locks.request(REFRESH_LOCK, task) : task();
  }
}
