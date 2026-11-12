import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { type Route, Router, type UrlTree, provideRouter } from '@angular/router';
import { AuthStore } from './auth-store';
import { guestGuard, roleGuard } from './guards';
import { provideTestConfig, session } from './testing';

describe('guards', () => {
  let store: AuthStore;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTestConfig(),
      ],
    });
    store = TestBed.inject(AuthStore);
    router = TestBed.inject(Router);
  });

  const run = (guard: ReturnType<typeof roleGuard>) =>
    TestBed.runInInjectionContext(() => guard({} as Route, [], {} as never));
  const url = (result: unknown) => router.serializeUrl(result as UrlTree);

  it('sin sesión, las áreas privadas llevan al login', () => {
    expect(url(run(roleGuard('CLIENT')))).toBe('/auth/login');
  });

  it('cada rol entra en su área', () => {
    store.applySession(session('NUTRITIONIST'));
    expect(run(roleGuard('NUTRITIONIST'))).toBe(true);
  });

  it('con otro rol, a su página de inicio', () => {
    store.applySession(session('CLIENT'));
    expect(url(run(roleGuard('ADMIN')))).toBe('/client');
  });

  it('las páginas de acceso son solo para quien no tiene sesión', () => {
    expect(run(guestGuard)).toBe(true);
    store.applySession(session('ADMIN'));
    expect(url(run(guestGuard))).toBe('/admin');
  });
});
