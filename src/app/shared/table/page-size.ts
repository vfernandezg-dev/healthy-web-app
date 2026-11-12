/**
 * Tamaños de página de los listados, uno por tipo de vista (la API admite hasta 100). Así todas las tablas, todas
 * las cuadrículas... piden lo mismo y el número no se repite por las plantillas.
 */
export const PAGE_SIZE = {
  /** Tablas (p-table). */
  table: 20,
  /** Cuadrículas de tarjetas: múltiplo de 2 y de 3, las columnas en tableta y en escritorio. */
  grid: 12,
  /** Listas con «Ver más» (comentarios, miembros). */
  list: 20,
  /** Publicaciones de un grupo. */
  feed: 10,
  /** Opciones de un desplegable: todas de una vez (el máximo de la API). */
  options: 100,
} as const;
