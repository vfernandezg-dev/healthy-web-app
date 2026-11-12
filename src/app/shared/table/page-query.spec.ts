import { pageParams, pageQueryOf, samePageQuery } from './page-query';

describe('pageQueryOf', () => {
  it('calcula la página a partir de la primera fila', () => {
    expect(pageQueryOf({ first: 40, rows: 20 }, 20, 'createdAt,desc')).toEqual({
      page: 2,
      sort: 'createdAt,desc',
    });
  });

  it('traduce el orden de la columna', () => {
    expect(pageQueryOf({ first: 0, rows: 10, sortField: 'email', sortOrder: 1 }, 10, 'x')).toEqual({
      page: 0,
      sort: 'email,asc',
    });
    expect(
      pageQueryOf({ first: 0, rows: 10, sortField: 'lastLoginAt', sortOrder: -1 }, 10, 'x').sort,
    ).toBe('lastLoginAt,desc');
  });

  it('sin filas en el evento usa el tamaño de página', () => {
    expect(pageQueryOf({ first: 30 }, 15, 'createdAt,asc').page).toBe(2);
  });
});

describe('samePageQuery', () => {
  it('compara por valor', () => {
    expect(samePageQuery({ page: 1, sort: 'a,asc' }, { page: 1, sort: 'a,asc' })).toBe(true);
    expect(samePageQuery({ page: 1, sort: 'a,asc' }, { page: 2, sort: 'a,asc' })).toBe(false);
  });
});

describe('pageParams', () => {
  it('incluye solo los filtros con valor, sin espacios', () => {
    expect(
      pageParams({ page: 0, sort: 'createdAt,desc' }, 20, { q: '  ana ', role: null, status: '' }),
    ).toEqual({ page: 0, size: 20, sort: 'createdAt,desc', q: 'ana' });
  });
});
