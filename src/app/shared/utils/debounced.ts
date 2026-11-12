import { type Signal, computed, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { sameValues } from './last-value';

/** Espera tras la última pulsación antes de buscar. */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * El valor de `source` cuando deja de cambiar durante `ms` milisegundos (por ejemplo, una búsqueda mientras se
 * escribe). Es el único sitio de la app que usa RxJS para esto: un debounce es un flujo en el tiempo. Llamar en el
 * contexto de inyección.
 */
export function debounced<T>(source: Signal<T>, ms = SEARCH_DEBOUNCE_MS): Signal<T> {
  return toSignal(toObservable(source).pipe(debounceTime(ms), distinctUntilChanged()), {
    initialValue: untracked(source),
  });
}

/**
 * Los filtros de un listado con el texto de búsqueda (`key`) retrasado: escribir no lanza una petición por letra,
 * pero los demás filtros (desplegables, botones) se aplican al momento. Se comparan por valor.
 */
export function debouncedSearch<F extends object>(
  filters: Signal<F>,
  key: { [K in keyof F]: F[K] extends string ? K : never }[keyof F],
  ms = SEARCH_DEBOUNCE_MS,
): Signal<F> {
  const text = debounced(
    computed(() => filters()[key]),
    ms,
  );
  return computed(() => ({ ...filters(), [key]: text() }), { equal: sameValues });
}
