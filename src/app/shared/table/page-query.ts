import type { PageMetadata } from '@core/api/schema';
import type { TableLazyLoadEvent } from 'primeng/table';

/** Una página de un listado de la API (`PagedModel`). */
export interface Paged<T> {
  readonly content: readonly T[];
  readonly page: PageMetadata;
}

/** Página y orden de un listado paginado en la API (`?page=0&size=20&sort=campo,desc`). */
export interface PageQuery {
  readonly page: number;
  readonly sort: string;
}

/** Lo que se pide a la API de un listado: página (desde 0), tamaño y orden. */
export interface PageRequest extends PageQuery {
  readonly size: number;
}

/** Igualdad por valor: p-table emite su primer `onLazyLoad` con lo que ya se pidió, y así no se repite la petición. */
export function samePageQuery(a: PageQuery, b: PageQuery): boolean {
  return a.page === b.page && a.sort === b.sort;
}

/** Página de la API (desde 0) que pide el evento de p-table en modo lazy (`first`, `rows`). */
export function pageOf(event: TableLazyLoadEvent, pageSize: number): number {
  const rows = event.rows && event.rows > 0 ? event.rows : pageSize;
  return Math.floor((event.first ?? 0) / rows);
}

/** Orden que pide el evento de p-table (`campo,asc|desc`), o null si no se ordena por ninguna columna. */
export function sortOf(event: TableLazyLoadEvent): string | null {
  const field = typeof event.sortField === 'string' && event.sortField ? event.sortField : null;
  return field ? `${field},${event.sortOrder === 1 ? 'asc' : 'desc'}` : null;
}

/**
 * Traduce el evento de p-table en modo lazy (`first`, `rows`, `sortField`, `sortOrder`) a página y orden de la API.
 * Sin columna de orden, usa `fallbackSort`.
 */
export function pageQueryOf(
  event: TableLazyLoadEvent,
  pageSize: number,
  fallbackSort: string,
): PageQuery {
  return { page: pageOf(event, pageSize), sort: sortOf(event) ?? fallbackSort };
}

/**
 * Parámetros de la petición: página, tamaño, orden y los filtros que tengan valor (los textos sin espacios a los
 * lados; los vacíos y los null no se envían).
 */
export function pageParams(
  request: PageRequest,
  filters: Readonly<Record<string, string | boolean | null | undefined>> = {},
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {
    page: request.page,
    size: request.size,
    sort: request.sort,
  };
  for (const [key, value] of Object.entries(filters)) {
    if (typeof value === 'boolean') {
      params[key] = value;
    } else if (value?.trim()) {
      params[key] = value.trim();
    }
  }
  return params;
}
