import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { AuthResponse } from '../../shared/models/auth-response.model';
import { AuthService } from './auth.service';

const SESSION: AuthResponse = {
  accessToken: 'token-1',
  tokenType: 'Bearer',
  expiresIn: 900,
  id: 4,
  nombre: 'Juan',
  apellido: 'Pérez',
  role: 'CLIENTE',
  clienteId: 1,
  nutricionistaId: null,
};

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem('healthybites_auth', JSON.stringify({ token: 'antiguo' }));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONFIG, useValue: { apiUrl: '/api/v1' } },
      ],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('borra la sesión que la versión anterior guardaba en localStorage', () => {
    expect(localStorage.getItem('healthybites_auth')).toBeNull();
  });

  it('guarda la sesión del login solo en memoria', async () => {
    const login = firstValueFrom(auth.login({ correo: 'juan.perez@healthybites.com', contrasena: 'healthy123' }));
    const req = http.expectOne('/api/v1/auth/login');
    expect(req.request.withCredentials).toBe(true);
    req.flush(SESSION);
    await login;

    expect(auth.accessToken()).toBe('token-1');
    expect(auth.getClienteId()).toBe(1);
    expect(auth.homeUrl()).toBe('/cliente/perfil');
    expect(localStorage.length).toBe(0);
  });

  it('restaura la sesión con la cookie del refresh token', async () => {
    const refreshed = auth.refresh();
    const req = http.expectOne('/api/v1/auth/refresh');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    req.flush(SESSION);

    expect(await refreshed).toBe(true);
    expect(auth.isAuthenticated()).toBe(true);
  });

  it('sin sesión válida, el refresh devuelve false sin lanzar', async () => {
    const refreshed = auth.refresh();
    http.expectOne('/api/v1/auth/refresh').flush({ detail: 'Sesión caducada' }, { status: 401, statusText: 'Unauthorized' });

    expect(await refreshed).toBe(false);
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('comparte una sola petición entre refrescos simultáneos', async () => {
    const first = auth.refresh();
    const second = auth.refresh();

    http.expectOne('/api/v1/auth/refresh').flush(SESSION);

    expect(await first).toBe(true);
    expect(await second).toBe(true);
  });

  it('el logout limpia la sesión, avisa al servidor y vuelve al login', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const refreshed = auth.refresh();
    http.expectOne('/api/v1/auth/refresh').flush(SESSION);
    await refreshed;

    auth.logout();

    const req = http.expectOne('/api/v1/auth/logout');
    expect(req.request.withCredentials).toBe(true);
    req.flush(null, { status: 204, statusText: 'No Content' });
    expect(auth.isAuthenticated()).toBe(false);
    expect(navigate).toHaveBeenCalledWith('/auth/login');
  });
});
