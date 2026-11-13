import { Component, computed, input } from '@angular/core';
import { LucideLock, LucideSparkles } from '@lucide/angular';
import { TIER_LABELS, type Tier } from '../i18n/labels';
import { Badge, type BadgeTone } from './badge';

const TIER_TONES: Record<Tier, BadgeTone> = { BASIC: 'neutral', PREMIUM: 'accent', VIP: 'vip' };

/**
 * Nivel que pide un plan o un contenido: Gratis (neutro), Premium (caqui) o VIP (azafrán sobre pino); con candado si
 * el usuario aún no puede abrirlo.
 */
@Component({
  selector: 'app-tier-badge',
  imports: [Badge, LucideLock, LucideSparkles],
  host: { class: 'inline-flex' },
  template: `
    <app-badge [tone]="tone()">
      @if (locked()) {
        <svg lucideLock class="size-3.5" title="Bloqueado"></svg>
      } @else if (tier() !== 'BASIC') {
        <svg lucideSparkles class="size-3.5"></svg>
      }
      {{ label() }}
    </app-badge>
  `,
})
export class TierBadge {
  readonly tier = input.required<Tier>();
  readonly locked = input(false);

  protected readonly label = computed(() =>
    this.tier() === 'BASIC' ? 'Gratis' : TIER_LABELS[this.tier()],
  );
  protected readonly tone = computed(() => TIER_TONES[this.tier()]);
}
