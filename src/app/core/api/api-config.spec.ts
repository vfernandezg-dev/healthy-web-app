import { normalizeBaseUrl } from './api-config';

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
