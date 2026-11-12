import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SeguimientoService } from './seguimiento.service';
import { APP_CONFIG } from '../config/app-config';

describe('SeguimientoService', () => {
  let service: SeguimientoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiUrl: '/api/v1' } },
      ],
    });
    service = TestBed.inject(SeguimientoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('borra el pesaje dentro de su meta (antes los ids iban cruzados)', () => {
    service.eliminarSeguimiento(1, 7).subscribe();

    const request = http.expectOne('/api/v1/meta/1/seguimientos/7');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
