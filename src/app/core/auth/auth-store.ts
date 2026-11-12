import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { RegisterRequest, SessionResponse, SessionUser } from '../api/schema';
import { AuthApi } from './auth-api';
import { withRefreshLock } from './refresh-lock';
import { homeFor } from './roles';

/** Claves que guardaba la versión 1 en localStorage (con el JWT); se borran al arrancar. */
const LEGACY_STORAGE_KEYS = ['healthybites_auth', 'resetToken'];
const CHANNEL = 'healthybites-session';
const LOGOUT = 'logout';

/**
 * Sesión del usuario (ver el ADR de sesión de la API).
 *
 * - El access token (JWT de 15 minutos) vive solo en memoria: no está en localStorage, así que un XSS no puede
 *   llevárselo para usarlo después.
 * - El refresh token está en una cookie httpOnly que el navegador solo envía a /auth/refresh y /auth/logout. Al
 *   arrancar y tras un 401 se pide un access token nuevo con ella.
 * - Un único refresh a la vez, también entre pestañas: el servidor rota el refresh token en cada uso.
 * - Cerrar sesión en una pestaña la cierra en todas (BroadcastChannel).
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  private readonly session = signal<SessionResponse | null>(null);
  private refreshInFlight: Promise<boolean> | null = null;
  private readonly channel =
    typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL);

  readonly user = computed<SessionUser | null>(() => this.session()?.user ?? null);
  readonly role = computed(() => this.user()?.role ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly homeUrl = computed(() => homeFor(this.role()));

  constructor() {
    if (typeof localStorage !== 'undefined') {
      LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    }
    this.channel?.addEventListener('message', (event: MessageEvent<unknown>) => {
      if (event.data === LOGOUT && this.session()) {
        this.session.set(null);
        void this.router.navigateByUrl('/auth/login');
      }
    });
  }

  accessToken(): string | null {
    return this.session()?.accessToken ?? null;
  }

  async login(email: string, password: string): Promise<SessionUser> {
    const session = await this.api.login({ email, password });
    this.session.set(session);
    return session.user;
  }

  /** Crea una cuenta de cliente e inicia sesión con ella. */
  async register(body: RegisterRequest): Promise<SessionUser> {
    await this.api.register(body);
    return this.login(body.email, body.password);
  }

  /** Acepta una invitación de nutricionista (crea la cuenta) e inicia sesión con ella. */
  async acceptInvitation(
    token: string,
    password: string,
    bio: string | null,
  ): Promise<SessionUser> {
    const account = await this.api.acceptInvitation({ token, password, bio });
    return this.login(account.email, password);
  }

  /** Aplica una sesión nueva que devuelve la API (por ejemplo, tras cambiar la contraseña). */
  applySession(session: SessionResponse): void {
    this.session.set(session);
  }

  /** Refleja en la sesión los datos editados en el perfil. */
  updateUser(changes: Partial<Pick<SessionUser, 'firstName' | 'lastName'>>): void {
    this.session.update(
      (current) => current && { ...current, user: { ...current.user, ...changes } },
    );
  }

  /**
   * Pide un access token nuevo con la cookie del refresh token. Nunca falla: devuelve false si no hay sesión.
   * Las llamadas simultáneas comparten la misma petición.
   */
  refresh(): Promise<boolean> {
    this.refreshInFlight ??= withRefreshLock(() => this.requestRefresh()).finally(() => {
      this.refreshInFlight = null;
    });
    return this.refreshInFlight;
  }

  /** Cierra la sesión en el servidor, en esta pestaña y en las demás. */
  async logout(): Promise<void> {
    this.session.set(null);
    this.channel?.postMessage(LOGOUT);
    try {
      await this.api.logout();
    } catch {
      // Sin red o con la sesión ya caducada: localmente ya está cerrada.
    }
    await this.router.navigateByUrl('/auth/login');
  }

  /** La sesión caducó y no se pudo renovar: al login, recordando dónde estaba. */
  expire(): void {
    this.session.set(null);
    const returnUrl = this.router.url;
    if (returnUrl.startsWith('/auth')) {
      return;
    }
    void this.router.navigate(['/auth/login'], {
      queryParams: returnUrl && returnUrl !== '/' ? { returnUrl } : {},
    });
  }

  private async requestRefresh(): Promise<boolean> {
    try {
      this.session.set(await this.api.refresh());
      return true;
    } catch {
      this.session.set(null);
      return false;
    }
  }
}
