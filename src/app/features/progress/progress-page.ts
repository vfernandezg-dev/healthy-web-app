import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, max, maxLength, min, required, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { LucideFlag, LucidePencil, LucidePlus, LucideTarget, LucideTrash } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import { toProblem } from '@core/api/problem';
import type { GoalResponse, WeightEntryResponse } from '@core/api/schema';
import { Confirmer } from '@core/ui/confirmer';
import { Toaster } from '@core/ui/toaster';
import { WeightChart } from '@shared/charts/weight-chart';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { GOAL_STATUS_LABELS, GOAL_STATUS_SEVERITY } from '@shared/i18n/labels';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { ProgressBar } from '@shared/ui/progress-bar';
import { todayIso } from '@shared/utils/date';
import { ProgressApi } from './data/progress-api';
import { GoalDialog } from './goal-dialog';
import { goalProgress } from './data/progress-math';
import { dialogState } from '@shared/ui/dialog-state';
import { formSubmitter } from '@shared/forms/form-submitter';

interface EntryModel {
  measuredOn: string;
  weightKg: number | null;
  notes: string;
}

/** Meta de peso activa con sus pesajes, el gráfico, la recomendación y las metas anteriores. */
@Component({
  selector: 'app-progress-page',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    FormField,
    InputText,
    InputNumber,
    ProgressBar,
    Skeleton,
    Tag,
    ButtonDirective,
    LucidePlus,
    LucidePencil,
    LucideTrash,
    LucideFlag,
    LabeledField,
    WeightChart,
    GoalDialog,
    EmptyState,
    LoadError,
    PageHeader,
  ],
  templateUrl: './progress-page.html',
})
export class ProgressPage {
  private readonly submitForm = formSubmitter();
  private readonly api = inject(ProgressApi);
  private readonly toaster = inject(Toaster);
  private readonly confirmer = inject(Confirmer);
  protected readonly goalDialog = dialogState<GoalResponse | null>();

  protected readonly goals = this.api.goals();
  private readonly allGoals = computed(() => (this.goals.hasValue() ? this.goals.value() : []));
  protected readonly activeGoal = computed(() =>
    this.allGoals().find((goal) => goal.status === 'ACTIVE'),
  );
  protected readonly pastGoals = computed(() =>
    this.allGoals().filter((goal) => goal.status !== 'ACTIVE'),
  );
  private readonly activeId = computed(() => this.activeGoal()?.id);
  protected readonly entries = this.api.entries(this.activeId);
  protected readonly recommendation = this.api.recommendation(this.activeId);

  protected readonly entryList = computed(() =>
    this.entries.hasValue() ? this.entries.value() : [],
  );
  /** Los pesajes del más reciente al más antiguo (para la tabla). */
  protected readonly entriesNewestFirst = computed(() => [...this.entryList()].reverse());
  protected readonly chartPoints = computed(() =>
    this.entryList().map((entry) => ({ date: entry.measuredOn, weightKg: entry.weightKg })),
  );
  protected readonly progress = computed(() => {
    const goal = this.activeGoal();
    return goal ? goalProgress(this.entryList(), goal.targetWeightKg) : null;
  });
  protected readonly recommendationProblem = computed(() =>
    this.recommendation.error() ? toProblem(this.recommendation.error()) : null,
  );

  protected readonly statusLabels = GOAL_STATUS_LABELS;
  protected readonly statusSeverity = GOAL_STATUS_SEVERITY;
  protected readonly goalIcon = LucideTarget;
  protected readonly today = todayIso();
  protected readonly describe = fieldDescription;
  protected readonly busy = signal(false);

  // ---------------------------------------------------------------- metas

  protected goalSaved(): void {
    this.goals.reload();
    this.toaster.success('Meta guardada');
  }

  protected async complete(goal: GoalResponse): Promise<void> {
    const confirmed = await this.confirmer.ask({
      header: 'Dar la meta por cumplida',
      message: `«${goal.title}» pasará a tus metas anteriores y podrás crear una nueva.`,
      acceptLabel: 'Dar por cumplida',
    });
    if (confirmed) {
      await this.run(() => this.api.complete(goal.id), '¡Enhorabuena! Meta cumplida');
    }
  }

  protected async abandon(goal: GoalResponse): Promise<void> {
    const confirmed = await this.confirmer.ask({
      header: 'Abandonar la meta',
      message: `«${goal.title}» se cerrará sin cumplir. Sus pesajes se conservan.`,
      acceptLabel: 'Abandonar',
      danger: true,
    });
    if (confirmed) {
      await this.run(() => this.api.abandon(goal.id), 'Meta abandonada');
    }
  }

  private async run(action: () => Promise<unknown>, success: string): Promise<void> {
    this.busy.set(true);
    try {
      await action();
      this.goals.reload();
      this.toaster.success(success);
    } catch {
      // El interceptor de errores ya ha avisado.
    } finally {
      this.busy.set(false);
    }
  }

  // ---------------------------------------------------------------- pesajes

  protected readonly editingEntry = signal<WeightEntryResponse | null>(null);
  protected readonly entryModel = signal<EntryModel>(this.emptyEntry());
  protected readonly entryForm = form(this.entryModel, (path) => {
    required(path.measuredOn, { message: 'Indica el día' });
    validate(path.measuredOn, ({ value }) =>
      value() > todayIso()
        ? { kind: 'future', message: 'La fecha del pesaje no puede ser futura' }
        : undefined,
    );
    required(path.weightKg, { message: 'Indica tu peso' });
    min(path.weightKg, 20, { message: 'El peso mínimo es 20 kg' });
    max(path.weightKg, 400, { message: 'El peso máximo es 400 kg' });
    maxLength(path.notes, 500, { message: 'Máximo 500 caracteres' });
  });

  protected editEntry(entry: WeightEntryResponse): void {
    this.editingEntry.set(entry);
    this.entryForm().reset({
      measuredOn: entry.measuredOn,
      weightKg: entry.weightKg,
      notes: entry.notes ?? '',
    });
  }

  protected cancelEdit(): void {
    this.editingEntry.set(null);
    this.entryForm().reset(this.emptyEntry());
  }

  protected saveEntry(event: Event, goalId: string): Promise<void> {
    const editing = this.editingEntry();
    return this.submitForm(event, this.entryForm, {
      // Un pesaje repetido o con fecha futura: el error va en la fecha.
      codeFields: {
        'weight-entry-exists': this.entryForm.measuredOn,
        'future-date': this.entryForm.measuredOn,
      },
      save: () => {
        const value = this.entryModel();
        const body = {
          measuredOn: value.measuredOn,
          // El esquema exige el peso: aquí nunca es null.
          weightKg: value.weightKg ?? 0,
          notes: value.notes.trim() || null,
        };
        return editing
          ? this.api.updateEntry(goalId, editing.id, body)
          : this.api.addEntry(goalId, body);
      },
      onSuccess: () => {
        this.cancelEdit();
        this.entries.reload();
        this.recommendation.reload();
        this.toaster.success(editing ? 'Pesaje actualizado' : 'Pesaje añadido');
      },
    });
  }

  protected async deleteEntry(goalId: string, entry: WeightEntryResponse): Promise<void> {
    const confirmed = await this.confirmer.ask({
      header: 'Borrar el pesaje',
      message: 'Se borrará el pesaje de ese día.',
      acceptLabel: 'Borrar',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    try {
      await this.api.deleteEntry(goalId, entry.id);
      this.entries.reload();
      this.recommendation.reload();
      this.toaster.success('Pesaje borrado');
    } catch {
      // El interceptor de errores ya ha avisado.
    }
  }

  private emptyEntry(): EntryModel {
    return { measuredOn: todayIso(), weightKg: null, notes: '' };
  }
}
