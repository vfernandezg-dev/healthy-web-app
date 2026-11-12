import { type Resource, type Signal, linkedSignal } from '@angular/core';

/**
 * El último valor que cargó un recurso. Al cambiar sus parámetros (página, orden, filtros) el recurso vuelve a
 * «loading» y se queda sin valor; con esto la vista conserva los datos anteriores mientras llegan los nuevos (una
 * tabla con su indicador de carga, en lugar de desmontarse y volver a montarse).
 */
export function lastValue<T>(resource: Resource<T | undefined>): Signal<T | undefined> {
  return linkedSignal<T | undefined, T | undefined>({
    source: () => (resource.hasValue() ? resource.value() : undefined),
    computation: (value, previous) => value ?? previous?.value,
  });
}

/**
 * Igualdad por valor de dos objetos planos (mismas claves y valores idénticos). Para los parámetros de una
 * petición: dos consultas iguales no deben lanzar otra petición aunque sean objetos distintos.
 */
export function sameValues(a: object, b: object): boolean {
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keys = Object.keys(left);
  return (
    keys.length === Object.keys(right).length &&
    keys.every(
      (key) => Object.prototype.hasOwnProperty.call(right, key) && Object.is(left[key], right[key]),
    )
  );
}
