import { Component, inject, signal } from '@angular/core';
import { LucidePlus, LucideTarget } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import type { GoalResponse, WeightEntryResponse } from '@core/api/schema';
import { Toaster } from '@core/ui/toaster';
import { WeightChart } from '@shared/charts/weight-chart';
import { dialogState } from '@shared/ui/dialog-state';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { ProgressStore } from './data/progress.store';
import { GoalDialog } from './goal-dialog';
import { GoalSummary } from './ui/goal-summary';
import { PastGoals } from './ui/past-goals';
import { RecommendationCard } from './ui/recommendation-card';
import { WeightEntriesTable } from './ui/weight-entries-table';
import { WeightEntryForm } from './weight-entry-form';

/**
 * Meta de peso activa con sus pesajes, el gráfico, la recomendación y las metas anteriores. Contenedor: el estado
 * está en {@link ProgressStore} y cada parte es un componente presentacional.
 */
@Component({
  selector: 'app-progress-page',
  imports: [
    ButtonDirective,
    Skeleton,
    LucidePlus,
    WeightChart,
    GoalDialog,
    GoalSummary,
    WeightEntryForm,
    WeightEntriesTable,
    RecommendationCard,
    PastGoals,
    EmptyState,
    LoadError,
    PageHeader,
  ],
  providers: [ProgressStore],
  templateUrl: './progress-page.html',
})
export class ProgressPage {
  private readonly toaster = inject(Toaster);

  protected readonly store = inject(ProgressStore);
  protected readonly goalDialog = dialogState<GoalResponse | null>();
  /** El pesaje que se está editando (lo elige la tabla, lo edita el formulario). */
  protected readonly editingEntry = signal<WeightEntryResponse | null>(null);
  protected readonly goalIcon = LucideTarget;

  protected entrySaved({ edited }: { readonly edited: boolean }): void {
    this.toaster.success(edited ? 'Pesaje actualizado' : 'Pesaje añadido');
    this.store.entriesChanged();
  }
}
