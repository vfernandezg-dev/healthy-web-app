import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CheckoutService, isPayPalUrl } from './checkout.service';
import { APP_CONFIG } from '../config/app-config';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiUrl: '/api/v1' } },
      ],
    });
    service = TestBed.inject(CheckoutService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('crea el pedido sin enviar URLs de vuelta (las decide la API)', () => {
    service.createPaypalOrder(7).subscribe();

    const request = http.expectOne((req) => req.url === '/api/v1/checkout/create');
    expect(request.request.params.keys()).toEqual(['suscripcionId']);
    expect(request.request.params.get('suscripcionId')).toBe('7');
    request.flush({ paypalUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=X' });
  });

  it('captura el pedido por su id', () => {
    service.capturePaypalOrder('5O190127TN364715T').subscribe();

    const request = http.expectOne((req) => req.url === '/api/v1/checkout/capture');
    expect(request.request.params.get('orderId')).toBe('5O190127TN364715T');
    request.flush({ completed: true, suscripcionId: 7 });
  });
});

describe('isPayPalUrl', () => {
  it('acepta PayPal por HTTPS', () => {
    expect(isPayPalUrl('https://www.paypal.com/checkoutnow?token=X')).toBe(true);
    expect(isPayPalUrl('https://www.sandbox.paypal.com/checkoutnow?token=X')).toBe(true);
  });

  it('rechaza cualquier otro destino', () => {
    expect(isPayPalUrl('http://www.paypal.com/checkoutnow')).toBe(false);
    expect(isPayPalUrl('https://paypal.com.evil.example/checkoutnow')).toBe(false);
    expect(isPayPalUrl('https://evilpaypal.com/checkoutnow')).toBe(false);
    expect(isPayPalUrl('javascript:alert(1)')).toBe(false);
    expect(isPayPalUrl('/cliente/perfil')).toBe(false);
  });
});
