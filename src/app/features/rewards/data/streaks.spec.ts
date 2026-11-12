import type { RewardResponse } from '@core/api/schema';
import { prizeLink, streakPercent } from './streaks';

function reward(currentDays: number | null, requiredStreakDays = 7): RewardResponse {
  return {
    id: 'r1',
    title: 'Una semana',
    description: 'Siete días seguidos.',
    requiredStreakDays,
    active: true,
    target: { id: 'plan-1', title: 'Semana ligera', type: 'MEAL_PLAN' },
    streak:
      currentDays === null
        ? null
        : {
            id: 's1',
            currentDays,
            completed: false,
            completedAt: null,
            lastCountedOn: null,
          },
  };
}

describe('streakPercent', () => {
  it('redondea y no pasa de 100', () => {
    expect(streakPercent(reward(3))).toBe(43);
    expect(streakPercent(reward(9))).toBe(100);
    expect(streakPercent(reward(null))).toBe(0);
  });
});

describe('prizeLink', () => {
  it('un plan, por su id; un contenido, al catálogo', () => {
    expect(prizeLink(reward(7))).toBe('/client/meal-plans/plan-1');
    expect(prizeLink({ ...reward(7), target: { id: 'c1', title: 'Guía', type: 'CONTENT' } })).toBe(
      '/client/content',
    );
  });
});
