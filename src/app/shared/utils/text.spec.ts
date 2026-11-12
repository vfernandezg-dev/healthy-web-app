import { matches, searchable } from './text';

describe('búsqueda de texto', () => {
  it('ignora mayúsculas, tildes y espacios de los extremos', () => {
    expect(searchable('  María PÉREZ ')).toBe('maria perez');
    expect(searchable(null)).toBe('');
  });

  it('encuentra subcadenas sin tildes', () => {
    expect(matches('María López', 'lopez')).toBe(true);
    expect(matches('Plan de volumen', 'VOLÚMEN')).toBe(true);
    expect(matches('Carlos', 'maría')).toBe(false);
  });

  it('una búsqueda vacía lo encuentra todo', () => {
    expect(matches('Lo que sea', '  ')).toBe(true);
  });
});
