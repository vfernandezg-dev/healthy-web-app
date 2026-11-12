# ADR 0001 · Angular sin zone.js, con signals y Signal Forms

- **Estado:** aceptada
- **Fecha:** 2026-11-11

## Contexto

La versión 1 estaba en Angular 18 con zone.js, formularios reactivos, unas 85 suscripciones manuales a observables
y componentes con detección de cambios por defecto. Había fugas (suscripciones sin cancelar), estados de carga
repetidos en cada pantalla y fechas que se rompían al editar.

Angular 22 trae estables la detección de cambios sin zone.js, `httpResource`, `resource`, `linkedSignal` y Signal
Forms, y usa `OnPush` por defecto.

## Decisión

- **Sin zone.js** (`provideZonelessChangeDetection`) y **`OnPush`** en todos los componentes. La vista se
  actualiza cuando cambia una signal que lee la plantilla.
- **Estado con signals.** `input()`/`output()`/`model()`, `computed` para lo derivado y `linkedSignal` para el
  estado que se reinicia con otro (la página vuelve a 0 al cambiar un filtro).
- **Lecturas con `httpResource`**, que da valor, estado de carga y error, y se cancela solo. Los parámetros son
  signals: al cambiar, la petición se repite. **Escrituras con `HttpClient`** convertido en promesas, para usarlas
  con `async`/`await` en los formularios y las acciones.
- **Signal Forms** para todos los formularios, con validadores que replican los de la API y un componente de campo
  (`<app-field>`) que muestra la etiqueta, la ayuda y el error enlazados con `aria-describedby`.
- **Plantillas con el control de flujo nuevo** (`@if`, `@for`, `@switch`, `@defer`, `@let`).

## Consecuencias

- Menos código y sin suscripciones que olvidar. El estado de carga, error y datos de cada pantalla sale del
  recurso.
- Un recurso pierde su valor cuando cambian sus parámetros. Las tablas paginadas conservan la última página
  mientras llega la siguiente (`lastValue`) y comparan la consulta por valor (`sameValues`), para no repetir
  peticiones idénticas.
- `resource.value()` lanza un error si el recurso está en error: las plantillas preguntan antes por `hasValue()`.
- Las librerías que dependen de zone.js quedan fuera. PrimeNG 22 y ngx-echarts funcionan sin él.

## Alternativas descartadas

- **Seguir con zone.js y RxJS en los componentes:** funciona, pero mantiene el código repetido y las fugas que se
  querían quitar.
- **NgRx Signal Store:** el estado de cada pantalla es local y lo resuelven los recursos. Un store global solo
  tendría la sesión, que ya está en `AuthStore`.
- **Formularios reactivos:** siguen siendo válidos, pero Signal Forms encaja con el resto del estado en signals y
  quita los `valueChanges`.
