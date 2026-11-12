import type { MealResponse } from '../../../core/api/schema';

export interface MealDay {
  readonly day: number;
  readonly meals: readonly MealResponse[];
  readonly calories: number;
}

/** Comidas agrupadas por día (1…duración), cada día en su orden. Los días sin comidas aparecen vacíos. */
export function mealsByDay(meals: readonly MealResponse[], durationDays: number): MealDay[] {
  const days: MealDay[] = [];
  for (let day = 1; day <= durationDays; day++) {
    const ofDay = meals
      .filter((meal) => meal.dayNumber === day)
      .sort((a, b) => a.position - b.position);
    days.push({ day, meals: ofDay, calories: ofDay.reduce((sum, meal) => sum + meal.calories, 0) });
  }
  return days;
}
