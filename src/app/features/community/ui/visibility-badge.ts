import { Component, computed, input } from '@angular/core';
import { LucideGlobe, LucideLock } from '@lucide/angular';
import { GROUP_VISIBILITY_LABELS, type GroupVisibility } from '@shared/i18n/labels';
import { Badge } from '@shared/ui/badge';

/** Grupo público (cualquiera entra y lee) o privado (el creador aprueba cada entrada). */
@Component({
  selector: 'app-visibility-badge',
  imports: [Badge],
  host: { class: 'inline-flex' },
  template: `
    <app-badge [tone]="isPrivate() ? 'outline' : 'neutral'" [icon]="isPrivate() ? lock : globe">
      {{ labels[visibility()] }}
    </app-badge>
  `,
})
export class VisibilityBadge {
  readonly visibility = input.required<GroupVisibility>();

  protected readonly labels = GROUP_VISIBILITY_LABELS;
  protected readonly lock = LucideLock;
  protected readonly globe = LucideGlobe;
  protected readonly isPrivate = computed(() => this.visibility() === 'PRIVATE');
}
