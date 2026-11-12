import { type Signal, computed, linkedSignal, signal } from '@angular/core';
import type { Paged } from '../table/page-query';

export type { Paged } from '../table/page-query';

/** Lo que la lista usa del recurso de una página (un `httpResource`). */
export interface PageResource<T> {
  hasValue(): boolean;
  readonly value: Signal<Paged<T> | undefined>;
  readonly error: Signal<unknown>;
  readonly isLoading: Signal<boolean>;
  reload(): boolean;
}

/** Una lista que crece con «Ver más» a partir de un listado paginado de la API. */
export interface LoadMore<T> {
  /** El recurso de la página pedida: su error y si está cargando; `reload()` para reintentar. */
  readonly resource: PageResource<T>;
  /** Lo cargado, en el orden de la API, y detrás lo añadido con `append` que aún no ha llegado en ninguna página. */
  readonly items: Signal<readonly T[]>;
  /** Ya llegó alguna página. */
  readonly loaded: Signal<boolean>;
  /** Quedan páginas por pedir. */
  readonly hasMore: Signal<boolean>;
  /** Pide la página siguiente. */
  more(): void;
  /** Vuelve a empezar por la primera página (por ejemplo, al abrir otra vez la lista) y olvida lo añadido. */
  reset(): void;
  /** Añade al final algo recién creado (en una lista de lo más antiguo a lo más nuevo, ese es su sitio). */
  append(item: T): void;
  /** Cambia un elemento cargado (por ejemplo, una solicitud recién aprobada). */
  replace(key: string, change: (item: T) => T): void;
  /**
   * Quita un elemento. Si quedan páginas, vuelve a pedir la última: al borrar, lo que venía detrás se corre un puesto
   * y, sin esto, «Ver más» se saltaría un elemento.
   */
  remove(key: string): void;
}

/**
 * Junta una página con lo ya cargado: lo que ya estaba se actualiza en su sitio y lo nuevo se añade al final, en el
 * orden de la API (sin repetir nada aunque una página se pida dos veces).
 */
export function mergePage<T>(
  loaded: readonly T[],
  page: readonly T[],
  key: (item: T) => string,
): T[] {
  const fresh = new Map(page.map((item) => [key(item), item]));
  const known = new Set(loaded.map(key));
  return [
    ...loaded.map((item) => fresh.get(key(item)) ?? item),
    ...page.filter((item) => !known.has(key(item))),
  ];
}

/**
 * Lista con «Ver más»: pide las páginas de una en una y las junta. La primera página empieza la lista de nuevo (tras
 * `reset()` o al recargarla); las demás se añaden detrás.
 */
export function loadMore<T>(options: {
  /** Crea el recurso que pide la página indicada. */
  readonly resource: (page: Signal<number>) => PageResource<T>;
  /** Identidad de un elemento, para no repetirlo al juntar páginas. */
  readonly key: (item: T) => string;
  /**
   * Cuando cambia (otro grupo, por ejemplo), se vuelve a la primera página. La petición del recurso tiene que leer
   * siempre la página (no solo en algunos casos) para enterarse del cambio.
   */
  readonly resetOn?: () => unknown;
}): LoadMore<T> {
  const { key } = options;
  const page = linkedSignal<unknown, number>({
    source: options.resetOn ?? (() => null),
    computation: () => 0,
  });
  const resource = options.resource(page);
  const current = () => (resource.hasValue() ? resource.value() : undefined);

  /** La última página recibida (se conserva mientras carga la siguiente). */
  const latest = linkedSignal<Paged<T> | undefined, Paged<T> | undefined>({
    source: current,
    computation: (value, previous) => value ?? previous?.value,
  });
  const fetched = linkedSignal<Paged<T> | undefined, readonly T[]>({
    source: current,
    computation: (value, previous) => {
      const before = previous?.value ?? [];
      if (!value) {
        return before;
      }
      return value.page.number === 0 ? value.content : mergePage(before, value.content, key);
    },
  });
  const added = signal<readonly T[]>([]);

  const hasMore = computed(() => {
    const meta = latest()?.page;
    return !!meta && meta.number + 1 < meta.totalPages;
  });
  const without = (id: string) => (list: readonly T[]) => list.filter((item) => key(item) !== id);
  const changing = (id: string, change: (item: T) => T) => (list: readonly T[]) =>
    list.map((item) => (key(item) === id ? change(item) : item));

  return {
    resource,
    items: computed(() => {
      const known = new Set(fetched().map(key));
      return [...fetched(), ...added().filter((item) => !known.has(key(item)))];
    }),
    loaded: computed(() => latest() !== undefined),
    hasMore,
    more: () => {
      if (hasMore() && !resource.isLoading()) {
        page.update((number) => number + 1);
      }
    },
    reset: () => {
      page.set(0);
      added.set([]);
    },
    append: (item) => added.update((list) => [...list, item]),
    replace: (id, change) => {
      fetched.update(changing(id, change));
      added.update(changing(id, change));
    },
    remove: (id) => {
      fetched.update(without(id));
      added.update(without(id));
      if (hasMore()) {
        resource.reload();
      }
    },
  };
}
