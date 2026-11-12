import { Component, computed, input } from '@angular/core';
import { LucideLock, LucideSparkles } from '@lucide/angular';
import { TIER_LABELS, type Tier } from '../i18n/labels';

/** Nivel que pide un plan o un contenido; con candado si el usuario aún no puede abrirlo. */
@Component({
  selector: 'app-tier-badge',
  imports: [LucideLock, LucideSparkles],
  host: { class: 'inline-flex' },
  template: `
    <span
      class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      [class]="tone()"
    >
      @if (locked()) {
        <svg lucideLock class="size-3.5" title="Bloqueado"></svg>
      } @else if (tier() !== 'BASIC') {
        <svg lucideSparkles class="size-3.5"></svg>
      }
      {{ label() }}
    </span>
  `,
})
export class TierBadge {
  readonly tier = input.required<Tier>();
  readonly locked = input(false);

  protected readonly label = computed(() =>
    this.tier() === 'BASIC' ? 'Gratis' : TIER_LABELS[this.tier()],
  );
  protected readonly tone = computed(() => {
    if (this.tier() === 'BASIC') {
      return 'bg-brand-50 text-brand-800';
    }
    return this.tier() === 'VIP' ? 'bg-amber-100 text-amber-900' : 'bg-mint text-brand-900';
  });
}
