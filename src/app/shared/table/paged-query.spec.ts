import { type Signal, resource, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { PageRequest, Paged } from './page-query';
import { type PagedQuery, pagedQuery } from './paged-query';

interface Item {
  readonly id: string;
}

interface Filters {
  readonly status: string | null;
}

type Request = Filters & PageRequest;

const pageOf = (request: Request, total: number, ids: string[]): Paged<Item> => ({
  content: ids.map((id) => ({ id })),
  page: {
    number: request.page,
    size: request.size,
    totalElements: total,
    totalPages: Math.ceil(total / request.size),
  },
});

/** Un listado contra una «API» controlada a mano: cada petición queda pendiente hasta `respond`. */
function setup() {
  const filters = signal<Filters>({ status: null });
  const requests: Request[] = [];
  const pending: ((page: Paged<Item>) => void)[] = [];
  let list!: PagedQuery<Item>;
  TestBed.runInInjectionContext(() => {
    list = pagedQuery<Item, Filters>({
      filters,
      defaultSort: 'createdAt,desc',
      pageSize: 2,
      load: (request: Signal<Request>) =>
        resource({
          params: () => request(),
          loader: ({ params }) => {
            requests.push(params);
            return new Promise<Paged<Item>>((resolve) => pending.push(resolve));
          },
        }),
    });
  });
  const settle = async () => {
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve, 0));
    TestBed.tick();
  };
  const respond = async (total: number, ids: string[]) => {
    const request = requests.at(-1);
    const resolve = pending.at(-1);
    if (!request || !resolve) {
      throw new Error('No hay ninguna petición pendiente');
    }
    resolve(pageOf(request, total, ids));
    await settle();
  };
  return { list, filters, requests, respond, settle };
}

describe('pagedQuery', () => {
  it('pide la primera página con el orden y el tamaño indicados', async () => {
    const { list, requests, respond, settle } = setup();
    await settle();

    expect(requests).toEqual([{ status: null, page: 0, size: 2, sort: 'createdAt,desc' }]);
    await respond(5, ['a', 'b']);
    expect(list.items().map((item) => item.id)).toEqual(['a', 'b']);
    expect(list.total()).toBe(5);
    expect(list.first()).toBe(0);
  });

  it('conserva la página anterior mientras llega la siguiente', async () => {
    const { list, requests, respond, settle } = setup();
    await settle();
    await respond(5, ['a', 'b']);
    // Como la plantilla: la página se lee al llegar (lastValue es un linkedSignal, perezoso).
    expect(list.items()).toHaveLength(2);

    list.onPage({ page: 1 });
    await settle();

    expect(requests.at(-1)).toMatchObject({ page: 1 });
    expect(list.loading()).toBe(true);
    expect(list.items().map((item) => item.id)).toEqual(['a', 'b']);
    await respond(5, ['c', 'd']);
    expect(list.items().map((item) => item.id)).toEqual(['c', 'd']);
    expect(list.first()).toBe(2);
  });

  it('al cambiar un filtro vuelve a la primera página con el mismo orden', async () => {
    const { list, filters, requests, respond, settle } = setup();
    await settle();
    await respond(5, ['a', 'b']);
    list.onLazyLoad({ first: 2, rows: 2, sortField: 'email', sortOrder: 1 });
    await settle();
    await respond(5, ['c', 'd']);

    filters.set({ status: 'ACTIVE' });
    await settle();

    expect(requests.at(-1)).toEqual({ status: 'ACTIVE', page: 0, size: 2, sort: 'email,asc' });
  });

  it('no repite una petición idéntica (p-table emite su primer onLazyLoad con lo ya pedido)', async () => {
    const { list, requests, settle } = setup();
    await settle();

    list.onLazyLoad({ first: 0, rows: 2 });
    await settle();

    expect(requests).toHaveLength(1);
  });

  it('tras borrar lo único de una página, va a la anterior', async () => {
    const { list, requests, respond, settle } = setup();
    await settle();
    await respond(3, ['a', 'b']);
    list.onPage({ page: 1 });
    await settle();
    await respond(3, ['c']);

    list.afterRemove();
    await settle();

    expect(requests.at(-1)).toMatchObject({ page: 0 });
  });

  it('tras crear, vuelve a la primera página; si ya está en ella, recarga', async () => {
    const { list, requests, respond, settle } = setup();
    await settle();
    await respond(3, ['a', 'b']);

    list.afterCreate();
    await settle();
    expect(requests).toHaveLength(2);
    expect(requests.at(-1)).toMatchObject({ page: 0 });

    await respond(4, ['nuevo', 'a']);
    list.onPage({ page: 1 });
    await settle();
    await respond(4, ['b', 'c']);
    list.afterCreate();
    await settle();
    expect(requests.at(-1)).toMatchObject({ page: 0 });
  });
});
