/**
 * Fechas sin hora (las de la API, `YYYY-MM-DD`). Se trabaja siempre con la fecha local de la persona: convertir a
 * UTC movería el día a quien está al oeste de Greenwich.
 */

/** Hoy en la zona horaria del navegador, como `YYYY-MM-DD`. */
export function todayIso(now: Date = new Date()): string {
  return toIsoDate(now);
}

/** `YYYY-MM-DD` de una fecha, con sus componentes locales. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Año, mes (1-12) y día de una fecha `YYYY-MM-DD`. Lanza un error si no tiene ese formato. */
function partsOf(iso: string): {
  readonly year: number;
  readonly month: number;
  readonly day: number;
} {
  const match = ISO_DATE.exec(iso);
  if (!match) {
    throw new RangeError(`Fecha no válida (se espera YYYY-MM-DD): ${iso}`);
  }
  const [, year, month, day] = match.map(Number);
  return { year: year ?? 0, month: month ?? 1, day: day ?? 1 };
}

/** Fecha local (a medianoche) a partir de `YYYY-MM-DD`. */
export function fromIsoDate(iso: string): Date {
  const { year, month, day } = partsOf(iso);
  return new Date(year, month - 1, day);
}

/** `YYYY-MM-DD` desplazada `days` días (negativo hacia atrás). */
export function addDays(iso: string, days: number): string {
  const date = fromIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** Años cumplidos en `onDate` por alguien nacido en `birthDate` (ambas `YYYY-MM-DD`). */
export function ageOn(birthDate: string, onDate: string = todayIso()): number {
  const birth = partsOf(birthDate);
  const on = partsOf(onDate);
  const birthdayPassed =
    on.month > birth.month || (on.month === birth.month && on.day >= birth.day);
  return on.year - birth.year - (birthdayPassed ? 0 : 1);
}
