import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let token: string | null;
  const auth = {
    accessToken: () => token,
    refresh: vi.fn<() => Promise<boolean>>(),
    expireSession: vi.fn(),
  };

  beforeEach(() => {
    token = 'token-viejo';
    auth.refresh.mockReset();
    auth.expireSession.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiUrl: '/api/v1' } },
        { provide: AuthService, useValue: auth },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('añade el access token solo a las peticiones a la API', () => {
    http.get('/api/v1/meta/cliente/1').subscribe();
    http.get('https://otro-sitio.example/datos').subscribe();
    http.post('/api/v1/auth/refresh', null).subscribe();

    expect(backend.expectOne('/api/v1/meta/cliente/1').request.headers.get('Authorization')).toBe('Bearer token-viejo');
    expect(backend.expectOne('https://otro-sitio.example/datos').request.headers.has('Authorization')).toBe(false);
    expect(backend.expectOne('/api/v1/auth/refresh').request.headers.has('Authorization')).toBe(false);
  });

  it('ante un 401 renueva la sesión y reintenta una vez con el token nuevo', async () => {
    auth.refresh.mockImplementation(async () => {
      token = 'token-nuevo';
      return true;
    });

    const response = firstValueFrom(http.get<{ ok: boolean }>('/api/v1/meta/cliente/1'));
    backend.expectOne('/api/v1/meta/cliente/1').flush(null, { status: 401, statusText: 'Unauthorized' });
    await Promise.resolve();
    const retry = backend.expectOne('/api/v1/meta/cliente/1');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer token-nuevo');
    retry.flush({ ok: true });

    expect(await response).toEqual({ ok: true });
    expect(auth.refresh).toHaveBeenCalledTimes(1);
  });

  it('si no se puede renovar, cierra la sesión y propaga el 401', async () => {
    auth.refresh.mockResolvedValue(false);

    const response = firstValueFrom(http.get('/api/v1/meta/cliente/1'));
    backend.expectOne('/api/v1/meta/cliente/1').flush(null, { status: 401, statusText: 'Unauthorized' });

    await expect(response).rejects.toMatchObject({ status: 401 });
    expect(auth.expireSession).toHaveBeenCalled();
  });

  it('no intenta renovar la sesión por errores que no son 401', async () => {
    const response = firstValueFrom(http.get('/api/v1/meta/cliente/1'));
    backend.expectOne('/api/v1/meta/cliente/1').flush(null, { status: 403, statusText: 'Forbidden' });

    await expect(response).rejects.toMatchObject({ status: 403 });
    expect(auth.refresh).not.toHaveBeenCalled();
  });
});
