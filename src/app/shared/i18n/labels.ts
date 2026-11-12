import type { components } from '../../core/api/schema';

type Schemas = components['schemas'];

/** Nombres en español de los valores que la API envía en inglés (enums). */
export const SEX_LABELS: Readonly<Record<NonNullable<Schemas['ClientData']['sex']>, string>> = {
  FEMALE: 'Mujer',
  MALE: 'Hombre',
  OTHER: 'Otro',
};

/** Opciones para un p-select o p-selectbutton a partir de un mapa de etiquetas. */
export function optionsOf<T extends string>(
  labels: Readonly<Record<T, string>>,
): { label: string; value: T }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ label: labels[value], value }));
}
