import { DOCUMENT } from '@angular/common';
import { Component, LOCALE_ID, computed, inject, input } from '@angular/core';
import type { EChartsCoreOption } from 'echarts/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { fromIsoDate } from '../utils/date';

export interface WeightPoint {
  /** `YYYY-MM-DD`. */
  readonly date: string;
  readonly weightKg: number;
}

/** A partir de cuántos puntos se añade el zoom (con pocos se ven todos de un vistazo). */
const ZOOM_FROM = 30;

/**
 * Evolución del peso con la línea del objetivo (ECharts, SVG), con los colores de la paleta. Para lectores de
 * pantalla, el contenedor tiene un resumen en texto; los datos completos están en la tabla de pesajes de la página.
 */
@Component({
  selector: 'app-weight-chart',
  imports: [NgxEchartsDirective],
  host: { class: 'block' },
  template: `
    <div
      echarts
      role="img"
      class="h-72 w-full"
      [attr.aria-label]="summary()"
      [options]="options()"
      [initOpts]="{ renderer: 'svg', locale: 'EN' }"
      [autoResize]="true"
    ></div>
  `,
})
export class WeightChart {
  private readonly document = inject(DOCUMENT);
  private readonly locale = inject(LOCALE_ID);

  /** Con el movimiento reducido, el gráfico se pinta sin animación. */
  private readonly animate =
    this.document.defaultView?.matchMedia('(prefers-reduced-motion: no-preference)').matches ??
    false;

  readonly points = input.required<readonly WeightPoint[]>();
  readonly targetKg = input.required<number>();

  private readonly number = computed(
    () => new Intl.NumberFormat(this.locale, { maximumFractionDigits: 1 }),
  );
  private readonly shortDate = computed(
    () => new Intl.DateTimeFormat(this.locale, { day: 'numeric', month: 'short' }),
  );

  protected readonly summary = computed(() => {
    const points = this.points();
    const kg = (value: number) => `${this.number().format(value)} kg`;
    const first = points.at(0);
    const last = points.at(-1);
    if (!first || !last) {
      return `Sin pesajes todavía. Objetivo: ${kg(this.targetKg())}.`;
    }
    return (
      `Evolución del peso: ${points.length} pesajes, de ${kg(first.weightKg)} ` +
      `a ${kg(last.weightKg)}. Objetivo: ${kg(this.targetKg())}.`
    );
  });

  protected readonly options = computed<EChartsCoreOption>(() => {
    const points = this.points();
    const color = (name: string, fallback: string) =>
      getComputedStyle(this.document.documentElement).getPropertyValue(name).trim() || fallback;
    // Colores de los tokens (src/styles/tokens.css); el respaldo solo se usa si el CSS aún no se ha cargado.
    const line = color('--color-brand-700', '#237047');
    const target = color('--color-accent-500', '#cb5f33');
    const targetText = color('--color-accent-700', '#943d1c');
    const ink = color('--color-ink', '#1c1a16');
    const muted = color('--color-muted', '#5e584d');
    const grid = color('--color-line', '#e4ded2');
    const card = color('--color-card', '#ffffff');
    const font = color('--font-sans', 'sans-serif');
    const zoom = points.length > ZOOM_FROM;
    const kg = (value: number) => `${this.number().format(value)} kg`;

    return {
      aria: { enabled: false },
      // La línea se dibuja de izquierda a derecha al cargar; los cambios de datos se animan más rápido.
      animation: this.animate,
      animationDuration: 900,
      animationEasing: 'cubicOut',
      animationDurationUpdate: 400,
      grid: { left: 56, right: 24, top: 32, bottom: zoom ? 72 : 32 },
      textStyle: { fontFamily: font },
      // Tooltip como una tarjeta: blanco, filete y radio de la interfaz.
      tooltip: {
        trigger: 'axis',
        backgroundColor: card,
        borderColor: grid,
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: ink, fontFamily: font },
        extraCssText: 'border-radius: 8px; box-shadow: 0 12px 32px -12px rgb(28 26 22 / 0.22);',
        valueFormatter: (value: unknown) => kg(Number(value)),
      },
      xAxis: {
        type: 'time',
        axisLine: { lineStyle: { color: grid } },
        axisLabel: {
          color: muted,
          hideOverlap: true,
          formatter: (value: number) => this.shortDate().format(new Date(value)),
        },
      },
      yAxis: {
        type: 'value',
        scale: true,
        // El rango incluye siempre el objetivo, para que se vea su línea.
        // Límites pares con margen, para que caigan en la escala (de 2 en 2 kg con pocos kilos de diferencia).
        min: (range: { min: number }) =>
          Math.floor((Math.min(range.min, this.targetKg()) - 1) / 2) * 2,
        max: (range: { max: number }) =>
          Math.ceil((Math.max(range.max, this.targetKg()) + 1) / 2) * 2,
        splitLine: { lineStyle: { color: grid } },
        axisLabel: {
          color: muted,
          // Los extremos son el margen calculado arriba: sin etiqueta, para no amontonarse con la escala.
          showMinLabel: false,
          showMaxLabel: false,
          formatter: (value: number) => kg(value),
        },
      },
      dataZoom: zoom
        ? [{ type: 'inside' }, { type: 'slider', height: 24, bottom: 16, brushSelect: false }]
        : [],
      series: [
        {
          name: 'Peso',
          type: 'line',
          smooth: 0.3,
          symbol: 'circle',
          symbolSize: 7,
          data: points.map((point) => [fromIsoDate(point.date).getTime(), point.weightKg]),
          lineStyle: { color: line, width: 2 },
          itemStyle: { color: line, borderColor: card, borderWidth: 2 },
          // Área muy suave bajo la línea.
          areaStyle: { color: line, opacity: 0.08 },
          markLine: {
            symbol: 'none',
            silent: true,
            // Discontinua y en caqui: se distingue de la línea del peso también sin ver los colores.
            lineStyle: { type: 'dashed', color: target, width: 1.5 },
            label: {
              formatter: () => `Objetivo ${kg(this.targetKg())}`,
              position: 'insideEndTop',
              color: targetText,
              fontWeight: 600,
            },
            data: [{ yAxis: this.targetKg() }],
          },
        },
      ],
    };
  });
}
