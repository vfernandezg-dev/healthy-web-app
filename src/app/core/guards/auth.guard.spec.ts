import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authInverseGuard } from './auth-inverse.guard';
import { authGuard, roleGuard } from './auth.guard';
import { homeFor } from './role-home';

describe('guards de sesión', () => {
  let role: string | null;
  const auth = {
    isAuthenticated: () => role !== null,
    getUserRole: () => role,
    homeUrl: () => homeFor(role),
  };

  beforeEach(() => {
    role = null;
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });

  const serialize = (result: unknown) => TestBed.inject(Router).serializeUrl(result as UrlTree);

  it('sin sesión, authGuard manda al login recordando la URL (sin bucles)', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/cliente/meta' } as RouterStateSnapshot));
    expect(serialize(result)).toBe('/auth/login?returnUrl=%2Fcliente%2Fmeta');
  });

  it('roleGuard deja pasar al rol correcto y manda a cada uno a su inicio', () => {
    const segments = [new UrlSegment('cliente', {}), new UrlSegment('meta', {})];
    const clientArea = roleGuard('CLIENTE');

    role = 'CLIENTE';
    expect(TestBed.runInInjectionContext(() => clientArea({} as Route, segments, undefined as never))).toBe(true);

    role = 'NUTRICIONISTA';
    expect(serialize(TestBed.runInInjectionContext(() => clientArea({} as Route, segments, undefined as never))))
      .toBe('/nutricionista/plan-alimenticio/list');

    role = null;
    expect(serialize(TestBed.runInInjectionContext(() => clientArea({} as Route, segments, undefined as never))))
      .toBe('/auth/login?returnUrl=%2Fcliente%2Fmeta');
  });

  it('las páginas de invitado mandan a quien ya tiene sesión a su inicio', () => {
    role = 'ADMIN';
    const result = TestBed.runInInjectionContext(() =>
      authInverseGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
    expect(serialize(result)).toBe('/admin');
  });
});
