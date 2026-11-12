import type { MealResponse } from '@core/api/schema';

/** Máximo de comidas por día que admite la API (posiciones 1 a 20). */
export const MAX_MEALS_PER_DAY = 20;

/** Siguiente posición libre de un día: las comidas nuevas van al final. */
export function nextPosition(meals: readonly MealResponse[], day: number): number {
  const positions = meals.filter((meal) => meal.dayNumber === day).map((meal) => meal.position);
  return Math.min(MAX_MEALS_PER_DAY, positions.length === 0 ? 1 : Math.max(...positions) + 1);
}

/**
 * Posición de una comida al guardarla: la suya si sigue en el mismo día; si es nueva o cambia de día, al final del
 * día elegido.
 */
export function positionOnSave(
  meals: readonly MealResponse[],
  meal: MealResponse | null,
  day: number,
): number {
  return meal?.dayNumber === day ? meal.position : nextPosition(meals, day);
}
