import type { MealResponse } from '../../../core/api/schema';
import { mealsByDay } from './meals-by-day';

function meal(id: string, dayNumber: number, position: number, calories: number): MealResponse {
  return { id, dayNumber, position, calories, category: 'LUNCH', name: id, description: null };
}

describe('mealsByDay', () => {
  it('agrupa por día, ordena por posición y suma las calorías', () => {
    const days = mealsByDay(
      [meal('cena', 1, 3, 600), meal('desayuno', 1, 1, 400), meal('comida', 2, 2, 700)],
      3,
    );

    expect(days.map((day) => day.day)).toEqual([1, 2, 3]);
    expect(days[0].meals.map((m) => m.id)).toEqual(['desayuno', 'cena']);
    expect(days[0].calories).toBe(1000);
    expect(days[2]).toEqual({ day: 3, meals: [], calories: 0 });
  });
});
