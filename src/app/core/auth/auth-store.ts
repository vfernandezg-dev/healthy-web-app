import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { RegisterRequest, SessionResponse, SessionUser } from '../api/schema';
import { AuthApi } from './auth-api';
import { withRefreshLock } from './refresh-lock';
import { homeFor } from './roles';

/** Claves que guardaba la versión 1 en localStorage (con el JWT); se borran al arrancar. */
const LEGACY_STORAGE_KEYS = ['healthybites_auth', 'resetToken'];
const CHANNEL = 'healthybites-session';
/** Tope de espera al recuperar la sesión al arrancar: sin red, la app arranca igualmente (sin sesión). */
const RESTORE_TIMEOUT_MS = 8000;
/**
 * Indicio, sin datos personales, de que este navegador tiene una sesión abierta (la cookie es httpOnly: la página no
 * puede verla). Sin él, el arranque solo espera {@link RESTORE_TIMEOUT_WITHOUT_HINT_MS} a la API: quien llega por
 * primera vez ve el login enseguida, y esa petición sirve además para despertar la API mientras escribe.
 */
const SESSION_HINT_KEY = 'hb_session';
const RESTORE_TIMEOUT_WITHOUT_HINT_MS = 1500;

/** Avisos entre pestañas del mismo navegador. */
type SessionMessage =
  { readonly type: 'logout' } | { readonly type: 'login'; readonly userId: string };

/**
 * Resultado de renovar el access token:
 * - `renewed`: hay sesión nueva.
 * - `expired`: la API rechazó la cookie (400/401/403). No hay sesión.
 * - `unavailable`: sin red o error del servidor. La sesión que hubiera sigue intacta: no se echa a nadie al login
 *   por un corte momentáneo.
 */
export type RefreshOutcome = 'renewed' | 'expired' | 'unavailable';

/**
 * Sesión del usuario (ver el ADR de sesión de la API).
 *
 * - El access token (JWT de 15 minutos) vive solo en memoria: no está en localStorage, así que un XSS no puede
 *   llevárselo para usarlo después.
 * - El refresh token está en una cookie httpOnly que el navegador solo envía a /auth/refresh y /auth/logout. Al
 *   arrancar y tras un 401 se pide un access token nuevo con ella.
 * - Un único refresh a la vez, también entre pestañas: el servidor rota el refresh token en cada uso.
 * - Cerrar sesión en una pestaña la cierra en todas (BroadcastChannel). Entrar con otra cuenta en una pestaña lleva
 *   a las demás a la página de inicio de esa cuenta: la cookie es la misma para todas.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  private readonly session = signal<SessionResponse | null>(null);
  private refreshInFlight: Promise<RefreshOutcome> | null = null;
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
      void this.onMessage(event.data);
    });
  }

  accessToken(): string | null {
    return this.session()?.accessToken ?? null;
  }

  async login(email: string, password: string): Promise<SessionUser> {
    const session = await this.api.login({ email, password });
    this.setSession(session);
    this.broadcast({ type: 'login', userId: session.user.id });
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
    this.setSession(session);
  }

  /** Refleja en la sesión los datos editados en el perfil. */
  updateUser(changes: Partial<Pick<SessionUser, 'firstName' | 'lastName'>>): void {
    this.session.update(
      (current) => current && { ...current, user: { ...current.user, ...changes } },
    );
  }

  /**
   * Al arrancar: recupera la sesión con la cookie antes de la primera navegación, con un tope de espera (más corto si
   * este navegador no tenía sesión).
   */
  async restore(
    timeoutMs = readSessionHint() ? RESTORE_TIMEOUT_MS : RESTORE_TIMEOUT_WITHOUT_HINT_MS,
  ): Promise<void> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<void>((resolve) => {
      timer = setTimeout(resolve, timeoutMs);
    });
    try {
      await Promise.race([this.refresh(), timeout]);
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Pide un access token nuevo con la cookie del refresh token. Nunca lanza (ver {@link RefreshOutcome}). Las
   * llamadas simultáneas comparten la misma petición.
   */
  refresh(): Promise<RefreshOutcome> {
    this.refreshInFlight ??= withRefreshLock(() => this.requestRefresh()).finally(() => {
      this.refreshInFlight = null;
    });
    return this.refreshInFlight;
  }

  /** Cierra la sesión en el servidor, en esta pestaña y en las demás. */
  async logout(): Promise<void> {
    this.setSession(null);
    this.broadcast({ type: 'logout' });
    try {
      await this.api.logout();
    } catch {
      // Sin red o con la sesión ya caducada: localmente ya está cerrada.
    }
    await this.router.navigateByUrl('/auth/login');
  }

  /** La sesión caducó y no se pudo renovar: al login, recordando dónde estaba. */
  expire(): void {
    this.setSession(null);
    const returnUrl = this.router.url;
    if (returnUrl.startsWith('/auth')) {
      return;
    }
    void this.router.navigate(['/auth/login'], {
      queryParams: returnUrl && returnUrl !== '/' ? { returnUrl } : {},
    });
  }

  private async requestRefresh(): Promise<RefreshOutcome> {
    try {
      this.setSession(await this.api.refresh());
      return 'renewed';
    } catch (error) {
      if (isRejection(error)) {
        this.setSession(null);
        return 'expired';
      }
      return 'unavailable';
    }
  }

  /** Cambia la sesión y su indicio. Un fallo de red no pasa por aquí: la sesión que hubiera (y su indicio) sigue. */
  private setSession(session: SessionResponse | null): void {
    this.session.set(session);
    writeSessionHint(session !== null);
  }

  private broadcast(message: SessionMessage): void {
    this.channel?.postMessage(message);
  }

  private async onMessage(data: unknown): Promise<void> {
    if (!isSessionMessage(data)) {
      return;
    }
    if (data.type === 'logout') {
      if (this.session()) {
        this.setSession(null);
        await this.router.navigateByUrl('/auth/login');
      }
      return;
    }
    // Otra pestaña ha entrado con otra cuenta: la cookie ya es de esa cuenta, así que esta pestaña la adopta.
    if (this.user()?.id !== data.userId && (await this.refresh()) === 'renewed') {
      await this.router.navigateByUrl(this.homeUrl());
    }
  }
}

/** ¿Tenía este navegador una sesión abierta? Si no se puede leer el almacenamiento, se supone que sí (espera larga). */
function readSessionHint(): boolean {
  try {
    return typeof localStorage === 'undefined' || localStorage.getItem(SESSION_HINT_KEY) !== null;
  } catch {
    return true;
  }
}

function writeSessionHint(present: boolean): void {
  try {
    if (present) {
      localStorage.setItem(SESSION_HINT_KEY, '1');
    } else {
      localStorage.removeItem(SESSION_HINT_KEY);
    }
  } catch {
    // Sin almacenamiento (modo privado estricto): el arranque esperará siempre el tope largo.
  }
}

/** La API rechazó la cookie del refresh token (caducada, revocada, reutilizada o sin la cabecera anti-CSRF). */
function isRejection(error: unknown): boolean {
  return error instanceof HttpErrorResponse && [400, 401, 403].includes(error.status);
}

function isSessionMessage(data: unknown): data is SessionMessage {
  if (typeof data !== 'object' || data === null || !('type' in data)) {
    return false;
  }
  return (
    data.type === 'logout' ||
    (data.type === 'login' && 'userId' in data && typeof data.userId === 'string')
  );
}
