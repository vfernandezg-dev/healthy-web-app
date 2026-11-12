# ADR 0005 · Pruebas E2E y de accesibilidad con la API simulada

- **Estado:** aceptada
- **Fecha:** 2026-11-12

## Contexto

La versión 1 tenía un solo test, que además fallaba. Las pantallas se rompían en silencio y la accesibilidad no se
comprobaba.

Probar contra la API real en cada PR exige levantar PostgreSQL, el correo y los datos de prueba, y hace los tests
lentos y frágiles. Muchos casos (errores, listas vacías, paginación, otra persona que resolvió antes una denuncia)
son difíciles de provocar con datos reales.

## Decisión

- **Vitest** para la lógica pura (fechas, cálculos de progreso e IMC, paginación, sesión, interceptores).
- **Playwright sobre el build de producción** (`dist/` servido en local), en escritorio y en móvil (Pixel 7), con
  la zona horaria y el idioma fijos y `reducedMotion`.
- **La API se simula con `page.route`.** Cualquier petición sin simular responde 501 y el test lo detecta. Los
  manejadores guardan el cuerpo de las escrituras para comprobar qué envía la app.
- **Un recorrido por funcionalidad y rol**, más [`e2e/routes.spec.ts`](../../e2e/routes.spec.ts), que visita todas
  las rutas con datos mínimos válidos (`e2e/support/fixtures.ts`) y comprueba el título de la pestaña, un solo `h1`,
  que no haya errores ni peticiones sin simular, y la accesibilidad.
- **axe** (`@axe-core/playwright`) con las reglas WCAG 2.2 AA en cada pantalla y en los diálogos abiertos.
- **Contra la API real, antes de cada release:** unos pocos recorridos largos
  ([`e2e-fullstack/`](../../e2e-fullstack/README.md)) con los datos de demostración comprueban lo que el
  simulacro no ve: la cookie de sesión, los parámetros que la API acepta, los correos y el contrato con la landing.

## Consecuencias

- Los E2E tardan menos de un minuto y no dependen de servicios externos.
- Un cambio de contrato no lo detectan los E2E, sino los tipos generados (ADR 0004).
- Los datos simulados pueden quedarse por detrás de la API. Los fixtures usan los tipos generados (`satisfies`)
  para que el compilador avise.

## Alternativas descartadas

- **E2E contra la API real en cada PR:** más fieles, pero lentos y frágiles. Se ejecutan antes de cada release.
- **Tests de componentes con TestBed para todo:** no prueban la navegación, el CSS ni la accesibilidad real.
- **Comprobar la accesibilidad a mano:** se olvida. axe en cada recorrido no.
