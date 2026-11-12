import { Component, input } from '@angular/core';
import { LucideGlobe, LucideLock } from '@lucide/angular';
import { GROUP_VISIBILITY_LABELS, type GroupVisibility } from '../../../shared/i18n/labels';

/** Grupo público (cualquiera entra y lee) o privado (el creador aprueba cada entrada). */
@Component({
  selector: 'app-visibility-badge',
  imports: [LucideGlobe, LucideLock],
  host: { class: 'inline-flex' },
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      [class]="
        visibility() === 'PRIVATE' ? 'bg-amber-100 text-amber-900' : 'bg-brand-50 text-brand-800'
      "
    >
      @if (visibility() === 'PRIVATE') {
        <svg lucideLock class="size-3.5"></svg>
      } @else {
        <svg lucideGlobe class="size-3.5"></svg>
      }
      {{ labels[visibility()] }}
    </span>
  `,
})
export class VisibilityBadge {
  readonly visibility = input.required<GroupVisibility>();

  protected readonly labels = GROUP_VISIBILITY_LABELS;
}
