import type { RewardResponse } from '@core/api/schema';

/** Avance de la racha hacia una recompensa, de 0 a 100 (entero). */
export function streakPercent(reward: RewardResponse): number {
  const current = reward.streak?.currentDays ?? 0;
  const required = reward.requiredStreakDays;
  return required > 0 ? Math.min(100, Math.round((current / required) * 100)) : 0;
}

/** Dónde ve el cliente el premio desbloqueado: el plan por su id; el contenido, en el catálogo («Desbloqueado…»). */
export function prizeLink(reward: RewardResponse): string {
  return reward.target.type === 'MEAL_PLAN'
    ? `/client/meal-plans/${reward.target.id}`
    : '/client/content';
}
