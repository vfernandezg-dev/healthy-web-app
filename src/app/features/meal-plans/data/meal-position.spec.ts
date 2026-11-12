import type { MealResponse } from '@core/api/schema';
import { nextPosition, positionOnSave } from './meal-position';

const meal = (id: string, dayNumber: number, position: number): MealResponse => ({
  id,
  dayNumber,
  position,
  category: 'LUNCH',
  name: id,
  description: null,
  calories: 500,
});

describe('nextPosition', () => {
  const meals = [meal('a', 1, 1), meal('b', 1, 3), meal('c', 2, 1)];

  it('va al final del día, o la primera si el día está vacío', () => {
    expect(nextPosition(meals, 1)).toBe(4);
    expect(nextPosition(meals, 2)).toBe(2);
    expect(nextPosition(meals, 3)).toBe(1);
  });

  it('no pasa del máximo de la API', () => {
    expect(nextPosition([meal('x', 1, 20)], 1)).toBe(20);
  });
});

describe('positionOnSave', () => {
  const meals = [meal('a', 1, 1), meal('b', 1, 2), meal('c', 2, 1)];

  it('conserva la posición si sigue en el mismo día', () => {
    expect(positionOnSave(meals, meals[0] ?? null, 1)).toBe(1);
  });

  it('si cambia de día o es nueva, va al final del día elegido', () => {
    expect(positionOnSave(meals, meals[0] ?? null, 2)).toBe(2);
    expect(positionOnSave(meals, null, 1)).toBe(3);
  });
});
