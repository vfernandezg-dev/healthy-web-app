import { Injectable, computed, inject } from '@angular/core';
import { toProblem } from '@core/api/problem';
import type { GoalResponse, WeightEntryResponse } from '@core/api/schema';
import { Toaster } from '@core/ui/toaster';
import { mutation } from '@shared/utils/mutation';
import { ProgressApi } from './progress-api';
import { goalProgress } from './progress-math';

/**
 * Estado de la página de progreso: las metas, la activa con sus pesajes y la recomendación, y lo que se calcula a
 * partir de ellos. La página lo provee (`providers`) y reparte los datos a componentes presentacionales.
 */
@Injectable()
export class ProgressStore {
  private readonly api = inject(ProgressApi);
  private readonly toaster = inject(Toaster);

  readonly goals = this.api.goals();
  private readonly allGoals = computed(() => (this.goals.hasValue() ? this.goals.value() : []));
  readonly activeGoal = computed(() => this.allGoals().find((goal) => goal.status === 'ACTIVE'));
  readonly pastGoals = computed(() => this.allGoals().filter((goal) => goal.status !== 'ACTIVE'));

  private readonly activeId = computed(() => this.activeGoal()?.id);
  readonly entries = this.api.entries(this.activeId);
  readonly recommendation = this.api.recommendation(this.activeId);

  /** Los pesajes, del más antiguo al último. */
  readonly entryList = computed(() => (this.entries.hasValue() ? this.entries.value() : []));
  /** Del más reciente al más antiguo (para la tabla). */
  readonly entriesNewestFirst = computed(() => [...this.entryList()].reverse());
  readonly chartPoints = computed(() =>
    this.entryList().map((entry) => ({ date: entry.measuredOn, weightKg: entry.weightKg })),
  );
  readonly progress = computed(() => {
    const goal = this.activeGoal();
    return goal ? goalProgress(this.entryList(), goal.targetWeightKg) : null;
  });
  readonly recommendationProblem = computed(() => {
    const error = this.recommendation.error();
    return error ? toProblem(error) : null;
  });

  readonly complete = mutation((goal: GoalResponse) => this.api.complete(goal.id), {
    confirm: (goal) => ({
      header: 'Dar la meta por cumplida',
      message: `«${goal.title}» pasará a tus metas anteriores y podrás crear una nueva.`,
      acceptLabel: 'Dar por cumplida',
    }),
    success: 'Meta cumplida',
    onSuccess: () => this.goals.reload(),
  });

  readonly abandon = mutation((goal: GoalResponse) => this.api.abandon(goal.id), {
    confirm: (goal) => ({
      header: 'Abandonar la meta',
      message: `«${goal.title}» se cerrará sin cumplir. Sus pesajes se conservan.`,
      acceptLabel: 'Abandonar',
      danger: true,
    }),
    success: 'Meta abandonada',
    onSuccess: () => this.goals.reload(),
  });

  readonly deleteEntry = mutation(
    (goalId: string, entry: WeightEntryResponse) => this.api.deleteEntry(goalId, entry.id),
    {
      confirm: {
        header: 'Borrar el pesaje',
        message: 'Se borrará el pesaje de ese día.',
        acceptLabel: 'Borrar',
        danger: true,
      },
      success: 'Pesaje borrado',
      onSuccess: () => this.entriesChanged(),
    },
  );

  goalSaved(): void {
    this.goals.reload();
    this.toaster.success('Meta guardada');
  }

  /** Tras añadir, editar o borrar un pesaje: la tabla, el gráfico y la recomendación cambian. */
  entriesChanged(): void {
    this.entries.reload();
    this.recommendation.reload();
  }
}
