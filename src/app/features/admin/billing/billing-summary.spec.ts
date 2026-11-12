import { activeSubscriptions, formatAmounts } from './billing-summary';

describe('resumen de facturación', () => {
  it('suma las suscripciones vigentes y las desglosa por nivel', () => {
    expect(
      activeSubscriptions({
        activeByTier: { PREMIUM: 8, VIP: 4, BASIC: 0 },
        monthlyRecurringRevenue: [],
        revenueLast30Days: [],
        paymentsLast30Days: 0,
      }),
    ).toEqual({ total: 12, detail: 'Premium: 8 · VIP: 4' });
  });

  it('sin suscripciones no hay desglose', () => {
    expect(
      activeSubscriptions({
        activeByTier: {},
        monthlyRecurringRevenue: [],
        revenueLast30Days: [],
        paymentsLast30Days: 0,
      }),
    ).toEqual({ total: 0, detail: null });
  });

  it('une los importes de cada moneda', () => {
    const format = (money: { amount: string; currency: string }) =>
      `${money.amount} ${money.currency}`;
    expect(
      formatAmounts(
        [
          { amount: '5.99', currency: 'USD' },
          { amount: '4.00', currency: 'EUR' },
        ],
        format,
      ),
    ).toBe('5.99 USD · 4.00 EUR');
    expect(formatAmounts([], format)).toBe('0');
  });
});
