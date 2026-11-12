import type { Routes } from '@angular/router';
import { provideEchartsCore } from 'ngx-echarts';

/** /client/progress. ECharts se registra aquí (y se descarga solo al mostrar el gráfico). */
export const PROGRESS_ROUTES: Routes = [
  {
    path: '',
    title: 'Tu progreso',
    providers: [provideEchartsCore({ echarts: () => import('../../shared/charts/echarts-setup') })],
    loadComponent: () => import('./progress-page').then((m) => m.ProgressPage),
  },
];
