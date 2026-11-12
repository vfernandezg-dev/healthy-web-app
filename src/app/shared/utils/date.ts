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

/** Fecha local (a medianoche) a partir de `YYYY-MM-DD`. */
export function fromIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
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
  const [birthYear, birthMonth, birthDay] = birthDate.split('-').map(Number);
  const [year, month, day] = onDate.split('-').map(Number);
  const birthdayPassed = month > birthMonth || (month === birthMonth && day >= birthDay);
  return year - birthYear - (birthdayPassed ? 0 : 1);
}
