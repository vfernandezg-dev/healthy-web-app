import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { LucideFlag, LucidePencil } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import type { GoalResponse } from '@core/api/schema';
import { GOAL_STATUS_LABELS, GOAL_STATUS_SEVERITY } from '@shared/i18n/labels';
import { ProgressBar } from '@shared/ui/progress-bar';
import type { GoalProgress } from '../data/progress-math';

/** La meta activa: objetivo, último pesaje, lo que queda y el avance; con sus acciones. */
@Component({
  selector: 'app-goal-summary',
  imports: [DatePipe, DecimalPipe, ButtonDirective, Tag, LucidePencil, LucideFlag, ProgressBar],
  host: { class: 'card block p-6 sm:p-8', role: 'region', 'aria-labelledby': 'goal-title' },
  templateUrl: './goal-summary.html',
})
export class GoalSummary {
  readonly goal = input.required<GoalResponse>();
  readonly progress = input.required<GoalProgress | null>();
  /** Se está cerrando la meta: los botones esperan. */
  readonly pending = input(false);
  readonly edit = output();
  readonly abandon = output();
  readonly complete = output();

  protected readonly statusLabels = GOAL_STATUS_LABELS;
  protected readonly statusSeverity = GOAL_STATUS_SEVERITY;
}
