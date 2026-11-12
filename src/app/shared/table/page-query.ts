import type { TableLazyLoadEvent } from 'primeng/table';

/** Página y orden de un listado paginado en la API (`?page=0&size=20&sort=campo,desc`). */
export interface PageQuery {
  readonly page: number;
  readonly sort: string;
}

/** Igualdad por valor: p-table emite su primer `onLazyLoad` con lo que ya se pidió, y así no se repite la petición. */
export function samePageQuery(a: PageQuery, b: PageQuery): boolean {
  return a.page === b.page && a.sort === b.sort;
}

/** Página de la API (desde 0) que pide el evento de p-table en modo lazy (`first`, `rows`). */
export function pageOf(event: TableLazyLoadEvent, pageSize: number): number {
  const rows = event.rows || pageSize;
  return Math.floor((event.first ?? 0) / rows);
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
  const field = typeof event.sortField === 'string' && event.sortField ? event.sortField : null;
  return {
    page: pageOf(event, pageSize),
    sort: field ? `${field},${event.sortOrder === 1 ? 'asc' : 'desc'}` : fallbackSort,
  };
}

/** Parámetros de la petición: página, tamaño, orden y los filtros que tengan valor. */
export function pageParams(
  query: PageQuery,
  pageSize: number,
  filters: Record<string, string | null | undefined> = {},
): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page,
    size: pageSize,
    sort: query.sort,
  };
  for (const [key, value] of Object.entries(filters)) {
    const trimmed = value?.trim();
    if (trimmed) {
      params[key] = trimmed;
    }
  }
  return params;
}
