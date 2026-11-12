# Decisiones de arquitectura (ADR)

Cada ADR recoge una decisión importante: el contexto, lo que se decidió, sus consecuencias y las alternativas
descartadas. Una decisión aceptada no se edita; si cambia, se escribe un ADR nuevo que la sustituye.

Las decisiones que comparte con la API (sesión, errores, contrato) están también en los
[ADR de healthy-bites-api](https://github.com/vfernandezg-dev/healthy-bites-api/tree/main/docs/adr).

| ADR                                          | Decisión                                            | Estado   |
| -------------------------------------------- | --------------------------------------------------- | -------- |
| [0001](0001-angular-sin-zone-y-signals.md)   | Angular sin zone.js, con signals y Signal Forms     | Aceptada |
| [0002](0002-primeng-tailwind-y-tema.md)      | PrimeNG + Tailwind CSS con el tema de la landing    | Aceptada |
| [0003](0003-sesion-en-memoria.md)            | Sesión con el access token en memoria               | Aceptada |
| [0004](0004-tipos-desde-openapi.md)          | Tipos de la API generados desde el contrato OpenAPI | Aceptada |
| [0005](0005-pruebas-e2e-con-api-simulada.md) | Pruebas E2E y de accesibilidad con la API simulada  | Aceptada |
| [0006](0006-graficos-con-echarts.md)         | Gráficos con Apache ECharts cargado bajo demanda    | Aceptada |
