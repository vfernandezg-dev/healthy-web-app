import { signal } from '@angular/core';
import type { Resource } from '@angular/core';
import { lastValue, sameValues } from './last-value';

/** Un recurso mínimo controlado por señales (solo lo que usa lastValue). */
function fakeResource<T>() {
  const value = signal<T | undefined>(undefined);
  const resource = {
    hasValue: () => value() !== undefined,
    value,
  } as unknown as Resource<T | undefined>;
  return { resource, value };
}

describe('lastValue', () => {
  it('conserva el último valor mientras el recurso carga', () => {
    const { resource, value } = fakeResource<string>();
    const last = lastValue(resource);
    expect(last()).toBeUndefined();

    value.set('página 1');
    expect(last()).toBe('página 1');

    value.set(undefined); // cargando la siguiente
    expect(last()).toBe('página 1');

    value.set('página 2');
    expect(last()).toBe('página 2');
  });
});

describe('sameValues', () => {
  it('compara claves y valores, no la identidad', () => {
    expect(sameValues({ page: 0, sort: 'a,desc' }, { page: 0, sort: 'a,desc' })).toBe(true);
    expect(sameValues({ page: 0, sort: 'a,desc' }, { page: 0, sort: 'a,asc' })).toBe(false);
    expect(sameValues({ page: 0 }, { page: 0, q: null })).toBe(false);
    expect(sameValues({ q: null }, { q: undefined })).toBe(false);
  });
});
