import { Component, computed, input } from '@angular/core';
import { LucideDynamicIcon, type LucideIcon } from '@lucide/angular';

/**
 * Tono de una etiqueta:
 * - neutral: información sin más (tipo de contenido, objetivo de un plan, archivado).
 * - outline: lo mismo, más discreto, sobre fondos que ya llevan color.
 * - positive: bien o activo (publicado, pagado, activa).
 * - accent: caqui, lo que pide atención sin ser un error (rachas, premios, Premium).
 * - warning: azafrán, pendiente (borrador, pago pendiente).
 * - danger: error o retirado a la fuerza (fallido, revocada, oculto).
 * - pine y vip: sobre verde pino; vip con el texto en azafrán.
 */
export type BadgeTone =
  'neutral' | 'outline' | 'positive' | 'accent' | 'warning' | 'danger' | 'pine' | 'vip';

/** Fondo 100 y texto 800/900 de cada escala (contraste comprobado en `pnpm theme:check`). */
const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-stone-200 text-stone-800',
  outline: 'border border-line-strong text-stone-700',
  positive: 'bg-brand-100 text-brand-900',
  accent: 'bg-accent-100 text-accent-900',
  warning: 'bg-saffron-100 text-saffron-900',
  danger: 'bg-danger-100 text-danger-800',
  pine: 'bg-pine text-on-pine',
  vip: 'bg-pine text-saffron-300',
};

/**
 * Etiqueta corta (estado, tipo, nivel): rectángulo de esquinas suaves, no píldora. El texto va proyectado y, si se
 * indica, un icono delante; para un icono con título propio (p. ej. «Bloqueado») se proyecta el svg directamente.
 */
@Component({
  selector: 'app-badge',
  imports: [LucideDynamicIcon],
  host: {
    class:
      'inline-flex w-fit items-center gap-1 rounded-badge px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
    '[class]': 'toneClass()',
  },
  template: `
    @if (icon(); as icon) {
      <svg [lucideIcon]="icon" class="size-3.5"></svg>
    }
    <ng-content />
  `,
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');
  readonly icon = input<LucideIcon>();

  protected readonly toneClass = computed(() => TONES[this.tone()]);
}
