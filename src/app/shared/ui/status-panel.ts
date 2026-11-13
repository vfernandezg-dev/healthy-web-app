import { Component, computed, input } from '@angular/core';
import { LucideDynamicIcon, type LucideIcon } from '@lucide/angular';

/** Qué cuenta la pantalla: que algo salió bien, una información, algo bloqueado (caqui) o un error. */
export type StatusTone = 'positive' | 'neutral' | 'accent' | 'danger';

const EYEBROW_TONES: Record<StatusTone, string> = {
  positive: 'text-brand-700',
  neutral: 'text-muted',
  accent: 'text-accent-700',
  danger: 'text-danger-700',
};

/**
 * Pantalla de estado (enlace enviado, enlace caducado, pago confirmado o cancelado, contenido bloqueado, 404...):
 * un antetítulo con el contexto, cuyo color e icono dicen cómo ha ido, el h1 de la página, la explicación
 * proyectada y, con el atributo `actions`, los enlaces o botones para seguir. Alineada a la izquierda, como el resto
 * de páginas; `framed` la mete en una tarjeta.
 */
@Component({
  selector: 'app-status-panel',
  imports: [LucideDynamicIcon],
  host: { '[class]': 'hostClass()' },
  template: `
    <p
      class="flex items-center gap-2 text-xs font-semibold tracking-[0.08em] uppercase"
      [class]="eyebrowClass()"
    >
      @if (icon(); as icon) {
        <svg [lucideIcon]="icon" class="size-4"></svg>
      }
      {{ eyebrow() }}
    </p>
    <h1 class="mt-3 text-2xl sm:text-3xl">{{ heading() }}</h1>
    <div class="mt-3 max-w-prose text-muted"><ng-content /></div>
    <div class="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 empty:hidden">
      <ng-content select="[actions]" />
    </div>
  `,
})
export class StatusPanel {
  readonly tone = input<StatusTone>('neutral');
  readonly eyebrow = input.required<string>();
  readonly heading = input.required<string>();
  readonly icon = input<LucideIcon>();
  readonly framed = input(true);

  protected readonly eyebrowClass = computed(() => EYEBROW_TONES[this.tone()]);
  protected readonly hostClass = computed(() =>
    this.framed() ? 'card block max-w-xl px-6 py-10 sm:px-10' : 'block motion-safe:animate-rise',
  );
}
