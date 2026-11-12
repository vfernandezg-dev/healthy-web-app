import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { authInterceptor } from './auth-interceptor';
import { AuthStore } from './auth-store';
import { provideTestConfig, session } from './testing';

const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let store: AuthStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTestConfig(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    store = TestBed.inject(AuthStore);
    store.applySession(session());
  });

  afterEach(() => backend.verify());

  it('añade el access token a la API y a nada más', () => {
    http.get('/api/v1/me').subscribe();
    http.get('https://otro-sitio.example/datos').subscribe();

    expect(backend.expectOne('/api/v1/me').request.headers.get('Authorization')).toBe(
      'Bearer token-1',
    );
    expect(
      backend.expectOne('https://otro-sitio.example/datos').request.headers.has('Authorization'),
    ).toBe(false);
  });

  it('no lo añade a las rutas públicas de sesión', () => {
    http.post('/api/v1/auth/login', {}).subscribe();
    expect(backend.expectOne('/api/v1/auth/login').request.headers.has('Authorization')).toBe(
      false,
    );
  });

  it('ante un 401 renueva la sesión una vez y repite la petición con el token nuevo', async () => {
    const result = firstValueFrom(http.get('/api/v1/me'));
    backend.expectOne('/api/v1/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    backend.expectOne('/api/v1/auth/refresh').flush(session('CLIENT', 'token-2'));
    await nextTick();

    const retry = backend.expectOne('/api/v1/me');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer token-2');
    retry.flush({ firstName: 'María' });

    await expect(result).resolves.toEqual({ firstName: 'María' });
  });

  it('un 401 que llega después de otra renovación se repite sin otro refresh', async () => {
    const first = firstValueFrom(http.get('/api/v1/me'));
    const second = firstValueFrom(http.get('/api/v1/me/goals'));

    backend.expectOne('/api/v1/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    backend.expectOne('/api/v1/auth/refresh').flush(session('CLIENT', 'token-2'));
    await nextTick();
    backend.expectOne('/api/v1/me').flush({ firstName: 'María' });
    await first;

    // La segunda salió con el token viejo: se repite con el nuevo, sin rotar otra vez el refresh token.
    backend.expectOne('/api/v1/me/goals').flush(null, { status: 401, statusText: 'Unauthorized' });
    await nextTick();
    backend.expectNone('/api/v1/auth/refresh');
    const retry = backend.expectOne('/api/v1/me/goals');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer token-2');
    retry.flush([]);

    await expect(second).resolves.toEqual([]);
  });

  it('sin red al renovar, falla la petición pero la sesión sigue', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const result = firstValueFrom(http.get('/api/v1/me'));
    backend.expectOne('/api/v1/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    backend.expectOne('/api/v1/auth/refresh').error(new ProgressEvent('error'));

    await expect(result).rejects.toMatchObject({ status: 401 });
    expect(store.isAuthenticated()).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('si el reintento vuelve a dar 401, la sesión ha caducado', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const result = firstValueFrom(http.get('/api/v1/me'));
    backend.expectOne('/api/v1/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    backend.expectOne('/api/v1/auth/refresh').flush(session('CLIENT', 'token-2'));
    await nextTick();
    backend.expectOne('/api/v1/me').flush(null, { status: 401, statusText: 'Unauthorized' });

    await expect(result).rejects.toMatchObject({ status: 401 });
    expect(store.isAuthenticated()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/auth/login'], expect.anything());
  });

  it('si no puede renovar, cierra la sesión y manda al login', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const result = firstValueFrom(http.get('/api/v1/me'));
    backend.expectOne('/api/v1/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    backend
      .expectOne('/api/v1/auth/refresh')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    await expect(result).rejects.toMatchObject({ status: 401 });
    expect(store.isAuthenticated()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/auth/login'], expect.anything());
  });
});
