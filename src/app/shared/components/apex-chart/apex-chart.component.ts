import { Component, DestroyRef, ElementRef, afterRenderEffect, inject, input, viewChild, ChangeDetectionStrategy } from '@angular/core';
import type ApexCharts from 'apexcharts';

/**
 * Envoltorio mínimo de ApexCharts 4 para Angular 21+.
 *
 * Sustituye a ng-apexcharts: sus versiones para Angular 21+ exigen ApexCharts 5 o superior, que ya no
 * tiene licencia MIT. Mantiene el selector y los inputs que usaban las plantillas.
 *
 * Temporal: en la fase 3 del plan de modernización los gráficos pasan a Apache ECharts.
 */
@Component({
  selector: 'apx-chart',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: '<div #host></div>',
})
export class ApexChartComponent {
  readonly series = input.required<ApexAxisChartSeries>();
  readonly chart = input.required<ApexChart>();
  readonly xaxis = input<ApexXAxis>();
  readonly title = input<ApexTitleSubtitle>();

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private instance?: ApexCharts;
  private renderCount = 0;

  constructor() {
    // Se vuelve a ejecutar cada vez que cambia un input; siempre después de renderizar la vista.
    afterRenderEffect(() => {
      const options = {
        series: this.series(),
        chart: this.chart(),
        xaxis: this.xaxis(),
        title: this.title(),
      };
      void this.render(options);
    });

    inject(DestroyRef).onDestroy(() => this.instance?.destroy());
  }

  private async render(options: ApexCharts.ApexOptions): Promise<void> {
    const current = ++this.renderCount;
    const { default: ApexChartsLib } = await import('apexcharts');
    // Si llegó otro cambio mientras se cargaba la librería, gana el más reciente.
    if (current !== this.renderCount) {
      return;
    }
    this.instance?.destroy();
    this.instance = new ApexChartsLib(this.host().nativeElement, options);
    await this.instance.render();
  }
}
