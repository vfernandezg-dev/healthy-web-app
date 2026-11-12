import { type Signal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { debouncedSearch } from './debounced';

interface Filters {
  readonly q: string;
  readonly status: string | null;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('debouncedSearch', () => {
  function setup() {
    const filters = signal<Filters>({ q: '', status: null });
    let result!: Signal<Filters>;
    TestBed.runInInjectionContext(() => {
      result = debouncedSearch(filters, 'q', 30);
    });
    return { filters, result };
  }

  it('aplica el texto cuando se deja de escribir', async () => {
    const { filters, result } = setup();

    filters.update((f) => ({ ...f, q: 'ma' }));
    TestBed.tick();
    filters.update((f) => ({ ...f, q: 'mar' }));
    TestBed.tick();
    expect(result().q).toBe('');

    await wait(60);
    TestBed.tick();
    expect(result().q).toBe('mar');
  });

  it('los demás filtros se aplican al momento', () => {
    const { filters, result } = setup();

    filters.update((f) => ({ ...f, status: 'ACTIVE' }));

    expect(result()).toEqual({ q: '', status: 'ACTIVE' });
  });
});
