import { Component, computed, input } from '@angular/core';

/** Lienzo del gráfico, en unidades del viewBox (3:1). */
const WIDTH = 120;
const HEIGHT = 40;
/** Margen para que el trazo y el punto final no se corten en los bordes. */
const PAD = 4;

export interface SparklineGeometry {
  /** Puntos de la línea (atributo `points` de un polyline). */
  readonly points: string;
  /** Último valor, donde va el punto. */
  readonly end: { readonly x: number; readonly y: number };
  /** Altura de la línea de referencia (null si no hay). */
  readonly targetY: number | null;
}

/**
 * Coordenadas de una línea de tendencia: los valores de izquierda a derecha, el mayor arriba. La referencia (por
 * ejemplo, el peso objetivo) amplía la escala para quedar siempre dentro. Con menos de dos valores no hay línea.
 */
export function sparklineGeometry(
  values: readonly number[],
  target: number | null = null,
  width = WIDTH,
  height = HEIGHT,
): SparklineGeometry | null {
  if (values.length < 2) {
    return null;
  }
  const domain = target === null ? values : [...values, target];
  const min = Math.min(...domain);
  const max = Math.max(...domain);
  const x = (index: number) => PAD + (index * (width - 2 * PAD)) / (values.length - 1);
  // Serie plana: en el centro.
  const y = (value: number) =>
    max === min ? height / 2 : PAD + ((max - value) * (height - 2 * PAD)) / (max - min);
  const round = (n: number) => Math.round(n * 10) / 10;
  const coords = values.map((value, index) => ({ x: round(x(index)), y: round(y(value)) }));
  const end = coords.at(-1) ?? { x: 0, y: 0 };
  return {
    points: coords.map((point) => `${point.x},${point.y}`).join(' '),
    end,
    targetY: target === null ? null : round(y(target)),
  };
}

/**
 * Línea de tendencia mínima en SVG (sin librería de gráficos), con una referencia discontinua opcional. Es
 * decorativa: los números van escritos al lado y el gráfico completo está en su página.
 */
@Component({
  selector: 'app-sparkline',
  host: { class: 'block aspect-[3/1]', 'aria-hidden': 'true' },
  template: `
    @if (geometry(); as g) {
      <svg [attr.viewBox]="viewBox" class="size-full overflow-visible">
        @if (g.targetY !== null) {
          <line
            x1="0"
            [attr.x2]="width"
            [attr.y1]="g.targetY"
            [attr.y2]="g.targetY"
            class="stroke-accent-500"
            stroke-width="1.5"
            stroke-dasharray="3 3"
          />
        }
        <polyline
          [attr.points]="g.points"
          fill="none"
          class="stroke-brand-700"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          [attr.cx]="g.end.x"
          [attr.cy]="g.end.y"
          r="3.5"
          class="fill-brand-700 stroke-card"
          stroke-width="2"
        />
      </svg>
    }
  `,
})
export class Sparkline {
  readonly values = input.required<readonly number[]>();
  readonly target = input<number | null>(null);

  protected readonly width = WIDTH;
  protected readonly viewBox = `0 0 ${WIDTH} ${HEIGHT}`;
  protected readonly geometry = computed(() => sparklineGeometry(this.values(), this.target()));
}
