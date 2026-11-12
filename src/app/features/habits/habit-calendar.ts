import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import type { HabitLogResponse } from '../../core/api/schema';
import { addDays } from '../../shared/utils/date';

interface Day {
  readonly date: string;
  readonly log: HabitLogResponse | undefined;
  readonly tone: string;
}

/** Tono de cada día según la media (0-10): más verde cuanto mejor. */
function toneOf(log: HabitLogResponse | undefined): string {
  if (!log) {
    return 'bg-white border border-dashed border-brand-200';
  }
  if (log.average >= 8) {
    return 'bg-brand-700';
  }
  if (log.average >= 6) {
    return 'bg-brand-500';
  }
  if (log.average >= 4) {
    return 'bg-brand-300';
  }
  return 'bg-brand-100';
}

/**
 * Los últimos días como cuadrícula de colores (de un vistazo, qué días registraste y cómo fueron). Cada celda
 * tiene su texto alternativo; el detalle completo está en la lista de la página.
 */
@Component({
  selector: 'app-habit-calendar',
  imports: [DatePipe, DecimalPipe],
  host: { class: 'block' },
  template: `
    <ol class="grid grid-cols-10 gap-1.5 sm:gap-2" role="list" aria-label="Tus últimos días">
      @for (day of days(); track day.date) {
        <li
          class="aspect-square rounded-lg"
          [class]="day.tone"
          [title]="
            (day.date | date: 'd MMM') + (day.log ? ': ' + (day.log.average | number: '1.0-1') : '')
          "
        >
          <span class="sr-only">
            {{ day.date | date: 'fullDate' }}:
            @if (day.log) {
              media de {{ day.log.average | number: '1.0-1' }} sobre 10
            } @else {
              sin registro
            }
          </span>
        </li>
      }
    </ol>
    <p class="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted" aria-hidden="true">
      <span>Peor</span>
      <span class="size-3 rounded bg-brand-100"></span>
      <span class="size-3 rounded bg-brand-300"></span>
      <span class="size-3 rounded bg-brand-500"></span>
      <span class="size-3 rounded bg-brand-700"></span>
      <span>Mejor</span>
    </p>
  `,
})
export class HabitCalendar {
  readonly logs = input.required<readonly HabitLogResponse[]>();
  /** Último día de la cuadrícula (`YYYY-MM-DD`). */
  readonly until = input.required<string>();
  readonly length = input(30);

  protected readonly days = computed<Day[]>(() => {
    const byDate = new Map(this.logs().map((log) => [log.loggedOn, log]));
    const first = addDays(this.until(), -(this.length() - 1));
    return Array.from({ length: this.length() }, (_, index) => {
      const date = addDays(first, index);
      const log = byDate.get(date);
      return { date, log, tone: toneOf(log) };
    });
  });
}
