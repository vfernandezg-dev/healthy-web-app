# ADR 0006 · Gráficos con Apache ECharts cargado bajo demanda

- **Estado:** aceptada
- **Fecha:** 2026-11-11

## Contexto

El cliente necesita un gráfico de la evolución de su peso con la línea del objetivo. La versión 1 usaba ApexCharts
4 con su script cargado dos veces.

El componente de gráficos de PrimeNG 22 pasó a ser de pago, y ApexCharts tiene licencia dual a partir de la
versión 5.

## Decisión

- **Apache ECharts 6** (licencia Apache 2.0) con **ngx-echarts**.
- **Solo los módulos que se usan,** desde `echarts/core`: línea, rejilla, tooltip, zoom de datos y línea de marca,
  con el renderizador SVG (`shared/charts/echarts-setup.ts`).
- **Carga bajo demanda:** `provideEchartsCore` en las rutas de progreso y el gráfico dentro de `@defer` con un
  esqueleto de altura fija. El chunk (unos 165 kB comprimido) solo se descarga al llegar al gráfico.
- **Accesible:** el gráfico es una imagen con un resumen en texto (`role="img"` y `aria-label`) y los datos están
  además en una tabla. Los colores salen de las variables del tema.

## Consecuencias

- El bundle inicial no paga el gráfico: solo quien abre su progreso lo descarga.
- Añadir otro tipo de gráfico obliga a registrar su módulo en `echarts-setup.ts`.
- ngx-echarts necesita que el módulo cargado exporte `init`.

## Alternativas descartadas

- **Gráficos de PrimeNG:** de pago en la versión 22.
- **ApexCharts 5:** licencia dual, comercial para algunos usos.
- **Chart.js:** válido, pero dibuja en canvas (peor accesibilidad sin trabajo extra), y ECharts trae zoom y líneas de
  marca sin plugins.
