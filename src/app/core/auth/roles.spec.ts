import { homeFor, safeReturnUrl } from './roles';

describe('roles', () => {
  it('cada rol tiene su página de inicio y sin sesión es el login', () => {
    expect(homeFor('CLIENT')).toBe('/client');
    expect(homeFor('NUTRITIONIST')).toBe('/nutritionist');
    expect(homeFor('ADMIN')).toBe('/admin');
    expect(homeFor(null)).toBe('/auth/login');
  });

  describe('safeReturnUrl', () => {
    it('acepta rutas internas del área del rol', () => {
      expect(safeReturnUrl('/client/progress', 'CLIENT')).toBe('/client/progress');
      expect(safeReturnUrl('/client?tab=1', 'CLIENT')).toBe('/client?tab=1');
    });

    it('rechaza otros sitios y rutas engañosas', () => {
      for (const url of [
        '//evil.example',
        'https://evil.example',
        '/\\evil.example',
        'javascript:x',
      ]) {
        expect(safeReturnUrl(url, 'CLIENT')).toBe('/client');
      }
    });

    it('rechaza áreas de otros roles', () => {
      expect(safeReturnUrl('/admin/users', 'CLIENT')).toBe('/client');
      expect(safeReturnUrl('/clientes', 'CLIENT')).toBe('/client');
    });

    it('sin returnUrl, la página de inicio', () => {
      expect(safeReturnUrl(undefined, 'NUTRITIONIST')).toBe('/nutritionist');
    });
  });
});
