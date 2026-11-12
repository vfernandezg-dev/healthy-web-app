import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTestConfig } from '../auth/testing';
import { ExternalNavigation, apiUrlFor, isPayPalUrl } from './external-navigation';

describe('isPayPalUrl', () => {
  it('acepta las páginas de PayPal por HTTPS', () => {
    expect(isPayPalUrl('https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T')).toBe(
      true,
    );
    expect(isPayPalUrl('https://www.paypal.com/checkoutnow?token=X')).toBe(true);
  });

  it('rechaza otros sitios, HTTP y dominios que solo lo parecen', () => {
    for (const url of [
      'http://www.paypal.com/checkoutnow',
      'https://paypal.com.evil.example/checkoutnow',
      'https://evilpaypal.com/checkoutnow',
      'javascript:alert(1)',
      '/client/subscription',
      'no es una url',
    ]) {
      expect(isPayPalUrl(url)).toBe(false);
    }
  });
});

describe('apiUrlFor', () => {
  const base = 'https://app.healthybites.example/client/content/guia';

  it('resuelve las rutas de la API, relativa o absoluta', () => {
    expect(apiUrlFor('/api/v1', '/media/m1?sig=abc', base)).toBe(
      'https://app.healthybites.example/api/v1/media/m1?sig=abc',
    );
    expect(apiUrlFor('https://api.healthybites.example/api/v1', '/media/m1', base)).toBe(
      'https://api.healthybites.example/api/v1/media/m1',
    );
  });

  it('rechaza lo que sale de la API', () => {
    for (const path of [
      '//evil.example/x',
      'https://evil.example/x',
      'media/m1',
      '/../../admin',
      '/\\evil.example',
      'javascript:alert(1)',
    ]) {
      expect(apiUrlFor('/api/v1', path, base)).toBeNull();
    }
  });
});

describe('ExternalNavigation', () => {
  function setup() {
    const assign = vi.fn();
    const tab = { opener: {} as unknown, location: { assign: vi.fn() }, close: vi.fn() };
    const fakeDocument = {
      baseURI: 'https://app.healthybites.example/',
      location: { assign },
      defaultView: { open: vi.fn(() => tab), location: { assign: vi.fn() } },
    };
    TestBed.configureTestingModule({
      providers: [provideTestConfig(), { provide: DOCUMENT, useValue: fakeDocument }],
    });
    return { navigation: TestBed.inject(ExternalNavigation), assign, tab };
  }

  it('solo va a PayPal si la URL es de PayPal', () => {
    const { navigation, assign } = setup();

    expect(navigation.toPayPal('https://evil.example/checkoutnow')).toBe(false);
    expect(assign).not.toHaveBeenCalled();

    expect(navigation.toPayPal('https://www.paypal.com/checkoutnow?token=X')).toBe(true);
    expect(assign).toHaveBeenCalledWith('https://www.paypal.com/checkoutnow?token=X');
  });

  it('la pestaña nueva no tiene opener y solo va a rutas de la API', () => {
    const { navigation, tab } = setup();

    const pending = navigation.openApiTab();
    expect(tab.opener).toBeNull();
    expect(pending.go('//evil.example/x')).toBe(false);
    expect(tab.close).toHaveBeenCalled();
    expect(tab.location.assign).not.toHaveBeenCalled();

    expect(navigation.openApiTab().go('/media/m1?sig=abc')).toBe(true);
    expect(tab.location.assign).toHaveBeenCalledWith(
      'https://app.healthybites.example/api/v1/media/m1?sig=abc',
    );
  });
});
