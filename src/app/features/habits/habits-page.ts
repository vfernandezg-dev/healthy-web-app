import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, maxLength, submit } from '@angular/forms/signals';
import { LucidePencil, LucideTrash } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';
import { Skeleton } from 'primeng/skeleton';
import { Slider } from 'primeng/slider';
import { Textarea } from 'primeng/textarea';
import { toProblem } from '@core/api/problem';
import type { HabitLogResponse } from '@core/api/schema';
import { Confirmer } from '@core/ui/confirmer';
import { Toaster } from '@core/ui/toaster';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { focusFirstInvalid, serverFieldErrors } from '@shared/forms/server-errors';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { addDays, todayIso } from '@shared/utils/date';
import { HabitsApi } from './data/habits-api';
import { HabitCalendar } from './ui/habit-calendar';

type Score = 'hydration' | 'nutrition' | 'exercise' | 'sleep';

interface HabitModel {
  loggedOn: string;
  hydration: number;
  nutrition: number;
  exercise: number;
  sleep: number;
  notes: string;
}

const SCORES: readonly { key: Score; label: string; hint: string }[] = [
  { key: 'hydration', label: 'Hidratación', hint: 'Agua y bebidas sin azúcar a lo largo del día.' },
  { key: 'nutrition', label: 'Alimentación', hint: 'Comidas equilibradas, fruta y verdura.' },
  { key: 'exercise', label: 'Ejercicio', hint: 'Movimiento: caminar, entrenar, subir escaleras.' },
  { key: 'sleep', label: 'Sueño', hint: 'Horas y calidad del descanso de anoche.' },
];

/** Registro diario de hábitos (hoy o ayer) y los últimos 30 días. Cada día registrado suma a las rachas. */
@Component({
  selector: 'app-habits-page',
  imports: [
    DatePipe,
    DecimalPipe,
    FormField,
    Slider,
    SelectButton,
    Textarea,
    Skeleton,
    ButtonDirective,
    LucidePencil,
    LucideTrash,
    LabeledField,
    HabitCalendar,
    LoadError,
    PageHeader,
  ],
  templateUrl: './habits-page.html',
})
export class HabitsPage {
  private readonly api = inject(HabitsApi);
  private readonly toaster = inject(Toaster);
  private readonly confirmer = inject(Confirmer);

  protected readonly today = todayIso();
  private readonly yesterday = addDays(this.today, -1);
  protected readonly logs = this.api.logs(
    signal({ from: addDays(this.today, -29), to: this.today }),
  );
  private readonly list = computed(() => (this.logs.hasValue() ? this.logs.value() : []));
  /** Del más reciente al más antiguo. */
  protected readonly history = computed(() =>
    [...this.list()].sort((a, b) => b.loggedOn.localeCompare(a.loggedOn)),
  );
  protected readonly todayLog = computed(() =>
    this.list().find((log) => log.loggedOn === this.today),
  );
  protected readonly yesterdayLog = computed(() =>
    this.list().find((log) => log.loggedOn === this.yesterday),
  );

  protected readonly scores = SCORES;
  protected readonly dayOptions = [
    { label: 'Hoy', value: this.today },
    { label: 'Ayer', value: this.yesterday },
  ];
  protected readonly describe = fieldDescription;

  /** Registro que se está editando (null: uno nuevo). */
  protected readonly editing = signal<HabitLogResponse | null>(null);
  /** Registrando otro día aunque hoy ya esté hecho (por ejemplo, ayer). */
  private readonly creating = signal(false);
  /** Formulario visible: si hoy no está registrado, al editar o al registrar otro día. */
  protected readonly formOpen = computed(
    () => this.editing() !== null || this.creating() || !this.todayLog(),
  );

  protected readonly model = signal<HabitModel>(this.emptyModel());
  protected readonly habitForm = form(this.model, (path) => {
    maxLength(path.notes, 500, { message: 'Máximo 500 caracteres' });
  });

  protected edit(log: HabitLogResponse): void {
    this.editing.set(log);
    this.habitForm().reset({
      loggedOn: log.loggedOn,
      hydration: log.hydration,
      nutrition: log.nutrition,
      exercise: log.exercise,
      sleep: log.sleep,
      notes: log.notes ?? '',
    });
  }

  protected registerYesterday(): void {
    this.editing.set(null);
    this.creating.set(true);
    this.habitForm().reset(this.emptyModel(this.yesterday));
  }

  protected cancel(): void {
    this.editing.set(null);
    this.creating.set(false);
    this.habitForm().reset(this.emptyModel());
  }

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.habitForm, {
      action: async () => {
        const value = this.model();
        const body = {
          loggedOn: value.loggedOn,
          hydration: value.hydration,
          nutrition: value.nutrition,
          exercise: value.exercise,
          sleep: value.sleep,
          notes: value.notes.trim() || null,
        };
        const editing = this.editing();
        try {
          if (editing) {
            await this.api.update(editing.id, body);
          } else {
            await this.api.create(body);
          }
          this.cancel();
          this.logs.reload();
          this.toaster.success(
            editing ? 'Registro actualizado' : '¡Día registrado!',
            editing ? undefined : 'Suma a tus rachas.',
          );
          return undefined;
        } catch (error) {
          const problem = toProblem(error);
          if (problem.errors.length > 0) {
            return serverFieldErrors(this.habitForm, problem);
          }
          this.toaster.problem(problem);
          return undefined;
        }
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }

  protected async remove(log: HabitLogResponse): Promise<void> {
    const confirmed = await this.confirmer.ask({
      header: 'Borrar el registro',
      message: 'Se borrará el registro de ese día. Las rachas ya contadas no cambian.',
      acceptLabel: 'Borrar',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    try {
      await this.api.delete(log.id);
      this.logs.reload();
      this.toaster.success('Registro borrado');
    } catch {
      // El interceptor de errores ya ha avisado.
    }
  }

  private emptyModel(day: string = this.today): HabitModel {
    return { loggedOn: day, hydration: 5, nutrition: 5, exercise: 5, sleep: 5, notes: '' };
  }
}
