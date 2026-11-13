import { avatarToneOf, initialsOf } from './person-avatar';

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

describe('avatarToneOf', () => {
  it('da siempre el mismo tono a la misma persona, sin importar mayúsculas ni espacios', () => {
    expect(avatarToneOf('María López')).toBe(avatarToneOf('  maría lópez '));
  });

  it('reparte los nombres entre los cuatro tonos', () => {
    const tones = new Set(
      ['María López', 'Carlos García', 'Ana Ruiz', 'Pedro Gómez', 'Lucía Torres', 'Bea Salas'].map(
        avatarToneOf,
      ),
    );
    expect(tones.size).toBeGreaterThan(1);
  });

  it('sin nombre usa un tono válido', () => {
    expect(avatarToneOf(null)).toMatch(/^bg-/);
  });
});
