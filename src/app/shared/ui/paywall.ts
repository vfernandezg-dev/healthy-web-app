import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideLock } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { toProblem } from '@core/api/problem';
import { TIER_LABELS, type Tier } from '../i18n/labels';
import { StatusPanel } from './status-panel';

const TIERS = new Set<string>(Object.keys(TIER_LABELS));

/**
 * Nivel de suscripción que pide algo bloqueado: la API responde 403 `subscription-required` con `requiredTier`.
 * Cualquier otro error (o ninguno) da undefined.
 */
export function requiredTierOf(error: unknown): Tier | undefined {
  if (!error) {
    return undefined;
  }
  const problem = toProblem(error);
  const tier = problem.properties['requiredTier'];
  return problem.code === 'subscription-required' && typeof tier === 'string' && TIERS.has(tier)
    ? (tier as Tier)
    : undefined;
}

/** Lo que ve un cliente en un plan o un contenido de un nivel superior al suyo: suscribirse o ganarlo con una racha. */
@Component({
  selector: 'app-paywall',
  imports: [RouterLink, ButtonDirective, StatusPanel],
  host: { class: 'block' },
  template: `
    <app-status-panel
      tone="accent"
      [eyebrow]="'Solo con ' + tierLabel()"
      [heading]="subject() + ' es ' + tierLabel()"
      [icon]="lockIcon"
    >
      <p>
        Suscríbete a {{ tierLabel() }} para {{ benefit() }}. También puedes conseguirlo completando
        una racha de hábitos que lo tenga como premio.
      </p>
      <ng-container ngProjectAs="[actions]">
        <a pButton routerLink="/client/subscription">Ver los planes de suscripción</a>
        <a pButton routerLink="/client/rewards" severity="secondary" variant="outlined">
          Ver las recompensas
        </a>
      </ng-container>
    </app-status-panel>
  `,
})
export class Paywall {
  readonly tier = input.required<Tier>();
  /** «Este plan», «Este contenido». */
  readonly subject = input.required<string>();
  /** Qué permite la suscripción: «ver sus comidas y seguirlo», «leerlo». */
  readonly benefit = input.required<string>();

  protected readonly tierLabel = computed(() => TIER_LABELS[this.tier()]);
  protected readonly lockIcon = LucideLock;
}
