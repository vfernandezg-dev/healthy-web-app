import { normalizeBaseUrl, readAppConfig } from './api-config';

describe('normalizeBaseUrl', () => {
  it('quita las barras finales', () => {
    expect(normalizeBaseUrl('https://api.example.com/api/v1/', '/api/v1')).toBe(
      'https://api.example.com/api/v1',
    );
  });

  it('usa el valor por defecto si no hay variable o está vacía', () => {
    expect(normalizeBaseUrl(undefined, '/api/v1')).toBe('/api/v1');
    expect(normalizeBaseUrl('   ', '/api/v1')).toBe('/api/v1');
  });
});

describe('readAppConfig', () => {
  it('lee la URL de la API y la clave de PrimeNG del entorno', () => {
    expect(
      readAppConfig({ NG_APP_API_URL: '/api/v1/', NG_APP_PRIMENG_LICENSE_KEY: ' clave ' }),
    ).toEqual({ apiUrl: '/api/v1', primengLicenseKey: 'clave' });
  });

  it('sin clave de PrimeNG la deja sin definir', () => {
    expect(readAppConfig({}).primengLicenseKey).toBeUndefined();
    expect(readAppConfig({ NG_APP_PRIMENG_LICENSE_KEY: '' }).primengLicenseKey).toBeUndefined();
  });
});
