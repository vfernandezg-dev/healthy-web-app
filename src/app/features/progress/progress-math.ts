import type { WeightEntryResponse } from '../../core/api/schema';

export interface GoalProgress {
  /** Último pesaje (null si aún no hay). */
  readonly currentKg: number | null;
  /** Diferencia hasta el objetivo, siempre positiva (0 si ya se alcanzó). */
  readonly remainingKg: number;
  /** Si la meta es bajar de peso (el primer pesaje está por encima del objetivo). */
  readonly losing: boolean;
  readonly reached: boolean;
  /** Avance desde el primer pesaje hasta el objetivo, de 0 a 100. */
  readonly percent: number;
}

/** Dónde está el cliente respecto a su objetivo, a partir de sus pesajes (del más antiguo al último). */
export function goalProgress(
  entries: readonly WeightEntryResponse[],
  targetKg: number,
): GoalProgress {
  if (entries.length === 0) {
    return { currentKg: null, remainingKg: 0, losing: true, reached: false, percent: 0 };
  }
  const start = entries[0].weightKg;
  const current = entries[entries.length - 1].weightKg;
  const losing = start >= targetKg;
  const reached = losing ? current <= targetKg : current >= targetKg;
  const total = Math.abs(start - targetKg);
  const done = losing ? start - current : current - start;
  const percent = reached
    ? 100
    : total === 0
      ? 0
      : Math.max(0, Math.min(100, (done / total) * 100));
  return {
    currentKg: current,
    remainingKg: reached ? 0 : round(Math.abs(current - targetKg)),
    losing,
    reached,
    percent: Math.round(percent),
  };
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
