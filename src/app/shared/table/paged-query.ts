import { type Resource, type Signal, computed, linkedSignal, signal } from '@angular/core';
import type { PaginatorState } from 'primeng/paginator';
import type { TableLazyLoadEvent } from 'primeng/table';
import { lastValue, sameValues } from '../utils/last-value';
import {
  type PageQuery,
  type PageRequest,
  type Paged,
  pageQueryOf,
  samePageQuery,
} from './page-query';

/** El recurso de una página (un `httpResource`): lo que el listado lee de él y `reload()` para reintentar. */
export type PagedResource<T> = Resource<Paged<T> | undefined> & { reload(): boolean };

export interface PagedQueryOptions<T, F extends object> {
  /** Filtros del listado. Al cambiar, se vuelve a la primera página (con el mismo orden). */
  readonly filters?: Signal<F>;
  /** Orden inicial, y el que se usa si la tabla no tiene ninguna columna de orden (`campo,asc|desc`). */
  readonly defaultSort: string;
  /** Elementos por página (ver `PAGE_SIZE`). */
  readonly pageSize: number;
  /**
   * Crea el recurso de la API a partir de la petición: filtros, página, tamaño y orden. La petición se compara por
   * valor, así que la misma consulta no se repite aunque se reconstruya el objeto.
   */
  readonly load: (request: Signal<F & PageRequest>) => PagedResource<T>;
}

/** Un listado paginado en la API, listo para una p-table en modo lazy o para un p-paginator. */
export interface PagedQuery<T> {
  readonly resource: PagedResource<T>;
  readonly pageSize: number;
  /**
   * La última página recibida. Se conserva mientras carga la siguiente: la vista no vuelve al esqueleto al cambiar de
   * página o de orden, solo muestra que está cargando.
   */
  readonly page: Signal<Paged<T> | undefined>;
  readonly items: Signal<readonly T[]>;
  readonly total: Signal<number>;
  /** Índice del primer elemento de la página (`first` de p-table y p-paginator). */
  readonly first: Signal<number>;
  readonly loading: Signal<boolean>;
  readonly error: Signal<Error | undefined>;
  /** Evento `onLazyLoad` de p-table: página y orden. */
  onLazyLoad(event: TableLazyLoadEvent): void;
  /** Evento `onPageChange` de p-paginator. */
  onPage(event: PaginatorState): void;
  /** Tras crear algo: lo nuevo sale primero, así que se vuelve a la primera página (o se recarga si ya está en ella). */
  afterCreate(): void;
  /** Tras quitar algo: si era lo único de una página que no es la primera, a la anterior; si no, se recarga. */
  afterRemove(): void;
  reload(): void;
}

/**
 * Estado de un listado paginado en la API: filtros, página y orden, el recurso que los pide y la última página
 * recibida. Llamar en el contexto de inyección (al declarar el campo del componente).
 */
export function pagedQuery<T, F extends object = Record<never, never>>(
  options: PagedQueryOptions<T, F>,
): PagedQuery<T> {
  const { pageSize, defaultSort, filters = signal({} as F) } = options;
  const query = linkedSignal<F, PageQuery>({
    source: filters,
    computation: (_, previous) => ({ page: 0, sort: previous?.value.sort ?? defaultSort }),
    equal: samePageQuery,
  });
  const resource = options.load(
    computed(() => ({ ...filters(), ...query(), size: pageSize }), { equal: sameValues }),
  );
  const page = lastValue(resource);
  const items = computed(() => page()?.content ?? []);

  return {
    resource,
    pageSize,
    page,
    items,
    total: computed(() => page()?.page.totalElements ?? 0),
    first: computed(() => query().page * pageSize),
    loading: resource.isLoading,
    error: resource.error,
    onLazyLoad: (event) => query.set(pageQueryOf(event, pageSize, defaultSort)),
    onPage: (event) => query.update((current) => ({ ...current, page: event.page ?? 0 })),
    afterCreate: () => {
      const current = query();
      if (current.page === 0) {
        resource.reload();
      } else {
        query.set({ ...current, page: 0 });
      }
    },
    afterRemove: () => {
      const current = query();
      if (current.page > 0 && items().length <= 1) {
        query.set({ ...current, page: current.page - 1 });
      } else {
        resource.reload();
      }
    },
    reload: () => {
      resource.reload();
    },
  };
}
