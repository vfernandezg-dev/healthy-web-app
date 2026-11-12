import type { BillingSummaryResponse, Money } from '@core/api/schema';
import { TIER_LABELS, type Tier } from '@shared/i18n/labels';

/** Suscripciones vigentes: el total y el desglose por nivel («Premium: 8 · VIP: 4»). */
export function activeSubscriptions(summary: BillingSummaryResponse): {
  readonly total: number;
  readonly detail: string | null;
} {
  const entries = (Object.entries(summary.activeByTier) as [Tier, number][]).filter(
    ([, count]) => count > 0,
  );
  return {
    total: entries.reduce((sum, [, count]) => sum + count, 0),
    detail:
      entries.length > 0
        ? entries.map(([tier, count]) => `${TIER_LABELS[tier]}: ${count}`).join(' · ')
        : null,
  };
}

/** Importes por moneda («87,88 US$ · 4,00 €»); sin importes, cero. */
export function formatAmounts(amounts: readonly Money[], format: (money: Money) => string): string {
  return amounts.length > 0 ? amounts.map(format).join(' · ') : '0';
}
