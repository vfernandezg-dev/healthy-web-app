import { initialsOf } from './person-avatar';

describe('initialsOf', () => {
  it('toma la primera letra del nombre y la del último apellido', () => {
    expect(initialsOf('María López')).toBe('ML');
    expect(initialsOf('  ana   maría pérez ')).toBe('AP');
  });

  it('con una sola palabra devuelve una letra', () => {
    expect(initialsOf('carlos')).toBe('C');
  });

  it('sin nombre devuelve un interrogante', () => {
    expect(initialsOf('')).toBe('?');
    expect(initialsOf(null)).toBe('?');
    expect(initialsOf(undefined)).toBe('?');
  });
});
