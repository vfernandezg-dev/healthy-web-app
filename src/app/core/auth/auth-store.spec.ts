import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthStore } from './auth-store';
import { provideTestConfig, session } from './testing';

describe('AuthStore', () => {
  let store: AuthStore;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem('healthybites_auth', '{"token":"jwt-antiguo"}');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTestConfig(),
      ],
    });
    store = TestBed.inject(AuthStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('borra el JWT que guardaba la versión anterior en localStorage', () => {
    expect(localStorage.getItem('healthybites_auth')).toBeNull();
  });

  it('el login guarda la sesión solo en memoria', async () => {
    const login = store.login('maria.lopez@healthybites.com', 'healthy123');
    const request = http.expectOne('/api/v1/auth/login');
    expect(request.request.body).toEqual({
      email: 'maria.lopez@healthybites.com',
      password: 'healthy123',
    });
    expect(request.request.withCredentials).toBe(true);
    request.flush(session('CLIENT'));

    await expect(login).resolves.toMatchObject({ firstName: 'María', role: 'CLIENT' });
    expect(store.accessToken()).toBe('token-1');
    expect(store.homeUrl()).toBe('/client');
    expect(JSON.stringify(localStorage)).not.toContain('token-1');
  });

  it('dos refresh a la vez comparten una sola petición, con la cabecera anti-CSRF', async () => {
    const first = store.refresh();
    const second = store.refresh();

    const request = http.expectOne('/api/v1/auth/refresh');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    request.flush(session('NUTRITIONIST'));

    await expect(Promise.all([first, second])).resolves.toEqual(['renewed', 'renewed']);
    expect(store.role()).toBe('NUTRITIONIST');
  });

  it('si el refresh falla no hay sesión, sin lanzar', async () => {
    const refresh = store.refresh();
    http
      .expectOne('/api/v1/auth/refresh')
      .flush({ code: 'invalid-refresh-token' }, { status: 401, statusText: 'Unauthorized' });

    await expect(refresh).resolves.toBe('expired');
    expect(store.isAuthenticated()).toBe(false);
    expect(store.homeUrl()).toBe('/auth/login');
  });

  it('sin red o con un 5xx al renovar, la sesión sigue', async () => {
    store.applySession(session());

    const offline = store.refresh();
    http.expectOne('/api/v1/auth/refresh').error(new ProgressEvent('error'));
    await expect(offline).resolves.toBe('unavailable');

    const failing = store.refresh();
    http
      .expectOne('/api/v1/auth/refresh')
      .flush(null, { status: 503, statusText: 'Service Unavailable' });
    await expect(failing).resolves.toBe('unavailable');

    expect(store.accessToken()).toBe('token-1');
  });

  it('al arrancar no espera a la API más de lo previsto', async () => {
    await store.restore(5);
    expect(store.isAuthenticated()).toBe(false);

    // Si la respuesta llega después, la sesión se aplica igualmente.
    http.expectOne('/api/v1/auth/refresh').flush(session());
    await Promise.resolve();
    expect(store.isAuthenticated()).toBe(true);
  });

  describe('indicio de sesión abierta', () => {
    beforeEach(() => localStorage.removeItem('hb_session'));

    it('se guarda al entrar (sin datos de la sesión) y se borra si la cookie ya no vale', async () => {
      const login = store.login('maria.lopez@healthybites.com', 'healthy123');
      http.expectOne('/api/v1/auth/login').flush(session('CLIENT'));
      await login;
      expect(localStorage.getItem('hb_session')).toBe('1');

      const refresh = store.refresh();
      http
        .expectOne('/api/v1/auth/refresh')
        .flush({ code: 'invalid-refresh-token' }, { status: 401, statusText: 'Unauthorized' });
      await refresh;
      expect(localStorage.getItem('hb_session')).toBeNull();
    });

    it('un corte de red no lo borra', async () => {
      store.applySession(session());

      const offline = store.refresh();
      http.expectOne('/api/v1/auth/refresh').error(new ProgressEvent('error'));
      await offline;

      expect(localStorage.getItem('hb_session')).toBe('1');
    });

    it('sin él, el arranque espera poco a la API (pero la pide igual, para despertarla)', async () => {
      vi.useFakeTimers();
      try {
        let done = false;
        void store.restore().then(() => (done = true));

        await vi.advanceTimersByTimeAsync(1000);
        http.expectOne('/api/v1/auth/refresh');
        expect(done).toBe(false);
        await vi.advanceTimersByTimeAsync(600);
        expect(done).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });

    it('con él, el arranque espera hasta 8 s', async () => {
      localStorage.setItem('hb_session', '1');
      vi.useFakeTimers();
      try {
        let done = false;
        void store.restore().then(() => (done = true));

        await vi.advanceTimersByTimeAsync(7000);
        http.expectOne('/api/v1/auth/refresh');
        expect(done).toBe(false);
        await vi.advanceTimersByTimeAsync(1100);
        expect(done).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  it('cerrar sesión la borra, avisa al servidor y vuelve al login', async () => {
    store.applySession(session());
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    const logout = store.logout();
    expect(store.isAuthenticated()).toBe(false);
    http.expectOne('/api/v1/auth/logout').flush(null, { status: 204, statusText: 'No Content' });
    await logout;

    expect(navigate).toHaveBeenCalledWith('/auth/login');
  });

  it('el registro crea la cuenta y después inicia sesión', async () => {
    const register = store.register({
      firstName: 'Ana',
      lastName: 'Torres',
      email: 'ana@correo.com',
      password: 'una-clave-larga',
    });
    http.expectOne('/api/v1/auth/register').flush({}, { status: 201, statusText: 'Created' });
    await Promise.resolve();
    http.expectOne('/api/v1/auth/login').flush(session('CLIENT'));

    await expect(register).resolves.toMatchObject({ role: 'CLIENT' });
  });

  describe('entre pestañas', () => {
    let tabs: BroadcastChannel;

    beforeEach(() => {
      tabs = new BroadcastChannel('healthybites-session');
    });

    afterEach(() => {
      tabs.close();
    });

    it('avisa a las demás pestañas al entrar', async () => {
      const received: unknown[] = [];
      tabs.addEventListener('message', (event: MessageEvent<unknown>) => received.push(event.data));

      const login = store.login('maria.lopez@healthybites.com', 'una-clave-larga');
      http.expectOne('/api/v1/auth/login').flush(session());
      await login;

      await vi.waitFor(() => {
        expect(received).toEqual([{ type: 'login', userId: session().user.id }]);
      });
    });

    it('si otra pestaña entra con otra cuenta, adopta esa sesión y va a su inicio', async () => {
      store.applySession(session('CLIENT'));
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      const other = session('NUTRITIONIST', 'token-2');

      tabs.postMessage({ type: 'login', userId: 'otra-cuenta' });

      await vi.waitFor(() => {
        http
          .expectOne('/api/v1/auth/refresh')
          .flush({ ...other, user: { ...other.user, id: 'otra-cuenta' } });
      });
      await vi.waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('/nutritionist');
      });
      expect(store.accessToken()).toBe('token-2');
    });

    it('si es la misma cuenta, o el mensaje no es de la app, no hace nada', async () => {
      store.applySession(session());
      tabs.postMessage({ type: 'login', userId: session().user.id });
      tabs.postMessage({ type: 'algo-raro' });

      await new Promise((resolve) => setTimeout(resolve, 20));
      http.expectNone('/api/v1/auth/refresh');
    });
  });

  it('actualiza el nombre de la sesión tras editar el perfil', () => {
    store.applySession(session());
    store.updateUser({ firstName: 'Mariana' });
    expect(store.user()?.firstName).toBe('Mariana');
  });
});
