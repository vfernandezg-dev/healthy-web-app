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

    await expect(Promise.all([first, second])).resolves.toEqual([true, true]);
    expect(store.role()).toBe('NUTRITIONIST');
  });

  it('si el refresh falla no hay sesión, sin lanzar', async () => {
    const refresh = store.refresh();
    http
      .expectOne('/api/v1/auth/refresh')
      .flush({ code: 'invalid-refresh-token' }, { status: 401, statusText: 'Unauthorized' });

    await expect(refresh).resolves.toBe(false);
    expect(store.isAuthenticated()).toBe(false);
    expect(store.homeUrl()).toBe('/auth/login');
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

  it('actualiza el nombre de la sesión tras editar el perfil', () => {
    store.applySession(session());
    store.updateUser({ firstName: 'Mariana' });
    expect(store.user()?.firstName).toBe('Mariana');
  });
});
