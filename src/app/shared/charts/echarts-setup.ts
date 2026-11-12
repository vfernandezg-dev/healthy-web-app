/**
 * ECharts con solo lo que usa la app (gráfico de líneas, rejilla, tooltip, zoom y línea de objetivo) y render SVG.
 * Se carga en diferido desde provideEchartsCore: nunca entra en el bundle inicial. La descripción accesible la pone
 * el componente (role="img" con un resumen), no el componente Aria de ECharts.
 *
 * ngx-echarts espera un módulo con `init` exportado por nombre (como `import('echarts')`).
 */
import { LineChart } from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  MarkLineComponent,
  TooltipComponent,
} from 'echarts/components';
import { init, use } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';

use([
  LineChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkLineComponent,
  SVGRenderer,
]);

export { init };
