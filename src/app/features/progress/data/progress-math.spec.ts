import type { WeightEntryResponse } from '@core/api/schema';
import { goalProgress } from './progress-math';

const entry = (weightKg: number, day: number): WeightEntryResponse => ({
  id: `e${day}`,
  measuredOn: `2026-11-${String(day).padStart(2, '0')}`,
  weightKg,
  notes: null,
});

describe('goalProgress', () => {
  it('sin pesajes no hay avance', () => {
    expect(goalProgress([], 65)).toEqual({
      currentKg: null,
      remainingKg: 0,
      losing: true,
      reached: false,
      percent: 0,
    });
  });

  it('al bajar de peso, mide lo que falta y el avance desde el primer pesaje', () => {
    expect(goalProgress([entry(80, 1), entry(77.4, 8)], 70)).toEqual({
      currentKg: 77.4,
      remainingKg: 7.4,
      losing: true,
      reached: false,
      percent: 26,
    });
  });

  it('al subir de peso, el objetivo se alcanza al superarlo', () => {
    expect(goalProgress([entry(60, 1), entry(65.2, 20)], 65)).toMatchObject({
      losing: false,
      reached: true,
      remainingKg: 0,
      percent: 100,
    });
  });

  it('si se aleja del objetivo, el avance no baja de cero', () => {
    expect(goalProgress([entry(80, 1), entry(82, 5)], 70).percent).toBe(0);
  });
});
