import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Tag } from 'primeng/tag';
import type { GoalResponse } from '@core/api/schema';
import { GOAL_STATUS_LABELS, GOAL_STATUS_SEVERITY } from '@shared/i18n/labels';

/** Metas cumplidas o abandonadas: objetivo, fecha y cómo terminaron. */
@Component({
  selector: 'app-past-goals',
  imports: [DatePipe, DecimalPipe, Tag],
  host: { class: 'card block p-6', role: 'region', 'aria-labelledby': 'past-title' },
  template: `
    <h2 id="past-title" class="text-lg font-bold">Metas anteriores</h2>
    <ul class="mt-3 divide-y divide-brand-50" role="list">
      @for (past of goals(); track past.id) {
        <li class="flex items-center justify-between gap-3 py-2.5">
          <span class="min-w-0">
            <span class="block truncate font-medium">{{ past.title }}</span>
            <span class="text-sm text-muted"
              >{{ past.targetWeightKg | number: '1.0-1' }} kg ·
              {{ past.completedAt ?? past.createdAt | date: 'mediumDate' }}</span
            >
          </span>
          <p-tag [value]="statusLabels[past.status]" [severity]="statusSeverity[past.status]" />
        </li>
      }
    </ul>
  `,
})
export class PastGoals {
  readonly goals = input.required<readonly GoalResponse[]>();

  protected readonly statusLabels = GOAL_STATUS_LABELS;
  protected readonly statusSeverity = GOAL_STATUS_SEVERITY;
}
