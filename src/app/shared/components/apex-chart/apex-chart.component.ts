import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  InjectionToken,
  afterRenderEffect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import type ApexCharts from 'apexcharts';

type ApexChartsConstructor = new (el: HTMLElement, options: ApexCharts.ApexOptions) => ApexCharts;

/** Carga diferida de la librería; los tests la sustituyen por una implementación falsa. */
export const APEXCHARTS_LOADER = new InjectionToken<() => Promise<ApexChartsConstructor>>('APEXCHARTS_LOADER', {
  providedIn: 'root',
  factory: () => async () => (await import('apexcharts')).default,
});

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
  private readonly loadApexCharts = inject(APEXCHARTS_LOADER);

  /**
   * El gráfico se crea una sola vez y los cambios se aplican con updateOptions(), encadenados sobre esta
   * promesa. Destruir y recrear la instancia en cada cambio provocaba una carrera: el render() asíncrono
   * (animado) de la instancia anterior terminaba después y dejaba en pantalla el gráfico sin datos.
   */
  private instance?: Promise<ApexCharts>;

  constructor() {
    // Se vuelve a ejecutar cada vez que cambia un input; siempre después de renderizar la vista.
    afterRenderEffect(() => {
      const options: ApexCharts.ApexOptions = {
        series: this.series(),
        chart: this.chart(),
        xaxis: this.xaxis(),
        title: this.title(),
      };
      void this.apply(options);
    });

    inject(DestroyRef).onDestroy(() => void this.instance?.then((instance) => instance.destroy()));
  }

  private async apply(options: ApexCharts.ApexOptions): Promise<void> {
    if (!this.instance) {
      this.instance = this.create(options);
      await this.instance;
      return;
    }
    const instance = await this.instance;
    await instance.updateOptions(options);
  }

  private async create(options: ApexCharts.ApexOptions): Promise<ApexCharts> {
    const ApexChartsLib = await this.loadApexCharts();
    const instance = new ApexChartsLib(this.host().nativeElement, options);
    await instance.render();
    return instance;
  }
}
