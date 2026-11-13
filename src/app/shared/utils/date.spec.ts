import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { addDays, ageOn, fromIsoDate, longDateLabel, toIsoDate, todayIso } from './date';

registerLocaleData(localeEs);

describe('fechas sin hora', () => {
  it('usa los componentes locales, no UTC', () => {
    // 23:30 del 11 de noviembre en hora local sigue siendo el 11.
    expect(toIsoDate(new Date(2026, 10, 11, 23, 30))).toBe('2026-11-11');
    expect(todayIso(new Date(2026, 0, 5, 8))).toBe('2026-01-05');
  });

  it('va y vuelve de YYYY-MM-DD', () => {
    expect(toIsoDate(fromIsoDate('2026-02-28'))).toBe('2026-02-28');
  });

  it('suma y resta días cruzando meses y años', () => {
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('calcula la edad según si ya pasó el cumpleaños', () => {
    expect(ageOn('1995-11-12', '2026-11-12')).toBe(31);
    expect(ageOn('1995-11-13', '2026-11-12')).toBe(30);
    expect(ageOn('2000-02-29', '2026-03-01')).toBe(26);
  });

  it('escribe la fecha larga en español', () => {
    expect(longDateLabel(new Date(2026, 10, 12, 9))).toBe('jueves, 12 de noviembre');
  });
});
