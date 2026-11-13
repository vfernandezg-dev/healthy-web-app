import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideLock } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { toProblem } from '@core/api/problem';
import { TIER_LABELS, type Tier } from '../i18n/labels';

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
  imports: [RouterLink, ButtonDirective, LucideLock],
  host: { class: 'block' },
  template: `
    <div class="card mx-auto max-w-xl px-6 py-12 text-center sm:px-12">
      <span class="mx-auto grid size-14 place-items-center rounded-full bg-mint text-brand-900">
        <svg lucideLock class="size-7"></svg>
      </span>
      <h1 class="mt-6 text-2xl">{{ subject() }} es {{ tierLabel() }}</h1>
      <p class="mt-2 text-muted">
        Suscríbete a {{ tierLabel() }} para {{ benefit() }}. También puedes conseguirlo completando
        una racha de hábitos que lo tenga como premio.
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <a pButton routerLink="/client/subscription">Ver los planes de suscripción</a>
        <a pButton routerLink="/client/rewards" severity="secondary" variant="outlined">
          Ver las recompensas
        </a>
      </div>
    </div>
  `,
})
export class Paywall {
  readonly tier = input.required<Tier>();
  /** «Este plan», «Este contenido». */
  readonly subject = input.required<string>();
  /** Qué permite la suscripción: «ver sus comidas y seguirlo», «leerlo». */
  readonly benefit = input.required<string>();

  protected readonly tierLabel = computed(() => TIER_LABELS[this.tier()]);
}
