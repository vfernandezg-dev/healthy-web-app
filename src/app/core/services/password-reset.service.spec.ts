import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PasswordResetService, tokenFromFragment } from './password-reset.service';
import { APP_CONFIG } from '../config/app-config';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiUrl: '/api/v1' } },
      ],
    });
    service = TestBed.inject(PasswordResetService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('pide el enlace a /auth/forgot-password con el correo en el cuerpo', () => {
    service.requestReset('ana@example.com').subscribe();

    const request = http.expectOne('/api/v1/auth/forgot-password');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ correo: 'ana@example.com' });
    request.flush(null, { status: 202, statusText: 'Accepted' });
  });

  it('cambia la contraseña con el token en el cuerpo, nunca en la URL', () => {
    service.resetPassword('tok_123', 'NuevaClave-2026').subscribe();

    const request = http.expectOne('/api/v1/auth/reset-password');
    expect(request.request.body).toEqual({ token: 'tok_123', contrasena: 'NuevaClave-2026' });
    request.flush(null, { status: 204, statusText: 'No Content' });
  });
});

describe('tokenFromFragment', () => {
  it('lee el token del fragmento del enlace', () => {
    expect(tokenFromFragment('token=AbC-123_xyz456789012345678901234')).toBe('AbC-123_xyz456789012345678901234');
  });

  it('descarta fragmentos sin token o con caracteres fuera de Base64URL', () => {
    expect(tokenFromFragment(null)).toBeNull();
    expect(tokenFromFragment('')).toBeNull();
    expect(tokenFromFragment('otro=1')).toBeNull();
    expect(tokenFromFragment('token=<script>alert(1)</script>')).toBeNull();
    expect(tokenFromFragment('token=corto')).toBeNull();
  });
});
