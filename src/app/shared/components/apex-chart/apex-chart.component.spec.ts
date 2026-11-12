import { TestBed } from '@angular/core/testing';
import { APEXCHARTS_LOADER, ApexChartComponent } from './apex-chart.component';

/** Sustituto de ApexCharts: registra las llamadas sin tocar el DOM (jsdom no implementa SVG). */
class FakeApexCharts {
  static instances: FakeApexCharts[] = [];
  readonly updates: unknown[] = [];
  destroyed = false;

  constructor(
    readonly el: HTMLElement,
    readonly options: { series?: unknown },
  ) {
    FakeApexCharts.instances.push(this);
  }

  render(): Promise<void> {
    return Promise.resolve();
  }

  updateOptions(options: unknown): Promise<void> {
    this.updates.push(options);
    return Promise.resolve();
  }

  destroy(): void {
    this.destroyed = true;
  }
}

describe('ApexChartComponent', () => {
  beforeEach(() => {
    FakeApexCharts.instances = [];
    TestBed.configureTestingModule({
      imports: [ApexChartComponent],
      providers: [{ provide: APEXCHARTS_LOADER, useValue: async () => FakeApexCharts }],
    });
  });

  async function settle(fixture: { whenStable(): Promise<unknown>; detectChanges(): void }) {
    fixture.detectChanges();
    await fixture.whenStable();
    // Deja terminar la carga diferida y el render() asíncrono.
    await new Promise((resolve) => setTimeout(resolve));
  }

  it('crea el gráfico una sola vez y aplica los cambios con updateOptions', async () => {
    const fixture = TestBed.createComponent(ApexChartComponent);
    fixture.componentRef.setInput('chart', { type: 'area', height: 350 });
    fixture.componentRef.setInput('series', [{ name: 'Peso', data: [] }]);
    await settle(fixture);

    fixture.componentRef.setInput('series', [{ name: 'Peso', data: [74, 73.4, 73] }]);
    await settle(fixture);

    expect(FakeApexCharts.instances).toHaveLength(1);
    const [chart] = FakeApexCharts.instances;
    expect(chart.updates).toHaveLength(1);
    expect(chart.updates[0]).toEqual(
      expect.objectContaining({ series: [{ name: 'Peso', data: [74, 73.4, 73] }] }),
    );
  });

  it('destruye el gráfico al destruir el componente', async () => {
    const fixture = TestBed.createComponent(ApexChartComponent);
    fixture.componentRef.setInput('chart', { type: 'area' });
    fixture.componentRef.setInput('series', [{ name: 'Peso', data: [74] }]);
    await settle(fixture);

    fixture.destroy();
    await new Promise((resolve) => setTimeout(resolve));

    expect(FakeApexCharts.instances[0].destroyed).toBe(true);
  });
});
