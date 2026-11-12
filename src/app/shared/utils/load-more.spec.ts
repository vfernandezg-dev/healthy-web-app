import { type Signal, signal } from '@angular/core';
import { type PageResource, type Paged, loadMore, mergePage } from './load-more';

interface Item {
  readonly id: string;
  readonly text: string;
}

const item = (id: string, text = id): Item => ({ id, text });

function pageOf(content: Item[], number: number, totalElements: number): Paged<Item> {
  return {
    content,
    page: { number, size: 2, totalElements, totalPages: Math.ceil(totalElements / 2) },
  };
}

/** Un recurso de páginas controlado a mano: el test decide qué página llega y cuándo. */
function setup(resetOn?: () => unknown) {
  const value = signal<Paged<Item> | undefined>(undefined);
  const isLoading = signal(false);
  const reloads: number[] = [];
  let page: Signal<number> = signal(0);
  const resource: PageResource<Item> = {
    hasValue: () => value() !== undefined,
    value,
    error: signal(undefined),
    isLoading,
    reload: () => {
      reloads.push(page());
      return true;
    },
  };
  const list = loadMore({
    resource: (requested) => {
      page = requested;
      return resource;
    },
    key: (entry) => entry.id,
    resetOn,
  });
  return { list, value, reloads, page: () => page() };
}

describe('mergePage', () => {
  it('actualiza lo que ya estaba y añade lo nuevo al final, sin repetir', () => {
    const merged = mergePage([item('a'), item('b')], [item('b', 'b2'), item('c')], (x) => x.id);
    expect(merged).toEqual([item('a'), item('b', 'b2'), item('c')]);
  });
});

describe('loadMore', () => {
  it('junta las páginas y conserva lo cargado mientras llega la siguiente', () => {
    const { list, value, page } = setup();
    expect(list.loaded()).toBe(false);

    value.set(pageOf([item('a'), item('b')], 0, 3));
    expect(list.items()).toEqual([item('a'), item('b')]);
    expect(list.hasMore()).toBe(true);

    list.more();
    expect(page()).toBe(1);
    value.set(undefined); // cargando
    expect(list.items()).toEqual([item('a'), item('b')]);

    value.set(pageOf([item('c')], 1, 3));
    expect(list.items()).toEqual([item('a'), item('b'), item('c')]);
    expect(list.hasMore()).toBe(false);

    list.more();
    expect(page()).toBe(1);
  });

  it('lo añadido va al final hasta que llega en una página', () => {
    const { list, value } = setup();
    value.set(pageOf([item('a'), item('b')], 0, 3));
    list.append(item('nuevo'));
    expect(list.items().map((x) => x.id)).toEqual(['a', 'b', 'nuevo']);

    list.more();
    value.set(pageOf([item('c'), item('nuevo')], 1, 4));
    expect(list.items().map((x) => x.id)).toEqual(['a', 'b', 'c', 'nuevo']);
  });

  it('al quitar uno con páginas pendientes, recarga la última pedida', () => {
    const { list, value, reloads } = setup();
    value.set(pageOf([item('a'), item('b')], 0, 3));
    list.remove('a');
    expect(list.items().map((x) => x.id)).toEqual(['b']);
    expect(reloads).toEqual([0]);

    // Sin páginas pendientes no hace falta.
    value.set(pageOf([item('b')], 0, 1));
    list.remove('b');
    expect(list.items()).toEqual([]);
    expect(reloads).toEqual([0]);
  });

  it('cambia un elemento cargado', () => {
    const { list, value } = setup();
    value.set(pageOf([item('a'), item('b')], 0, 2));
    list.replace('b', (x) => ({ ...x, text: 'aprobado' }));
    expect(list.items()).toEqual([item('a'), item('b', 'aprobado')]);
  });

  it('reset() vuelve a la primera página, que sustituye la lista, y olvida lo añadido', () => {
    const { list, value, page } = setup();
    value.set(pageOf([item('a'), item('b')], 0, 3));
    list.more();
    value.set(pageOf([item('c')], 1, 3));
    list.append(item('mío'));

    list.reset();
    expect(page()).toBe(0);
    value.set(pageOf([item('a'), item('b')], 0, 4));
    expect(list.items().map((x) => x.id)).toEqual(['a', 'b']);
    expect(list.hasMore()).toBe(true);
  });

  it('al cambiar resetOn vuelve a la primera página', () => {
    const group = signal('g1');
    const { list, value, page } = setup(group);
    value.set(pageOf([item('a'), item('b')], 0, 3));
    list.more();
    expect(page()).toBe(1);

    group.set('g2');
    expect(page()).toBe(0);
  });
});
