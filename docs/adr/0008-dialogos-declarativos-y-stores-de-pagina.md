# ADR 0008 · Diálogos declarativos, stores de página y piezas comunes de estado

- **Estado:** aceptada
- **Fecha:** 2026-11-12

## Contexto

La auditoría de la versión 2.0 encontró el mismo código repetido en muchos sitios:

| Patrón repetido                                          | Dónde         |
| -------------------------------------------------------- | ------------- |
| Lista paginada: página, orden, `lastValue`, `sameValues` | 5 tablas      |
| Paginador y esqueleto                                    | 7 cuadrículas |
| Búsqueda con debounce                                    | 4 sitios      |
| Marco del diálogo con su formulario                      | 8 diálogos    |
| `catch → toProblem → serverFieldErrors`                  | 19 bloques    |
| `busy = signal(false)` con `try/finally`                 | 11 sitios     |

Además:

- **Los diálogos eran imperativos** (`viewChild(X).open()`). Estaban siempre creados, había que reiniciarlos a mano y
  no se podían diferir. El de recompensas descargaba 200 elementos en cada visita a la página aunque no se abriera.
- **Algunas páginas mezclaban demasiado:**
  - progreso: 260 + 355 líneas;
  - grupo: 250 líneas;
  - la tarjeta de una publicación: 366 líneas, que pedía y borraba comentarios pero delegaba el borrado de la propia
    publicación.

## Decisión

**Piezas comunes en `shared/`:**

- `pagedQuery()` para los listados paginados (tablas y cuadrículas):
  - vuelve a la primera página al cambiar un filtro, sin perder el orden;
  - compara la petición por valor;
  - conserva la página anterior mientras llega la siguiente;
  - aplica las reglas tras crear o borrar (`afterCreate`, `afterRemove`).
- `<app-paged-grid>` como presentación de esos listados.
- `debouncedSearch()` para las búsquedas.
- `formSubmitter()` para enviar formularios:
  - un 422 marca los errores en sus campos;
  - `codeFields` lleva otros códigos a un campo concreto;
  - el resto va al mensaje del diálogo o a un aviso.
- `mutation()` para cada escritura: confirmación, `pending`/`running`, aviso de éxito y errores avisados una sola vez.

**Diálogos declarativos:**

- La página guarda un `dialogState()` y pinta el diálogo dentro de
  `@defer (when x.isOpen(); prefetch on idle)` + `@if`.
- Así el diálogo se crea al abrirlo, tiene su propio chunk y pide sus datos solo entonces.
- Recibe por `input()` lo que edita y emite `saved` y `closed`.
- `<app-form-dialog>` pone el marco: cabecera, error, Cancelar y enviar.

**El diálogo sigue siendo el contenedor de su caso de uso:** tiene su formulario y guarda con la API de su
funcionalidad.

**Stores de página** cuando una página combina varios recursos con sus escrituras:

- Una clase `@Injectable()` en los `providers` de la página si no depende de inputs (`ProgressStore`).
- Una función que se llama en el contexto de inyección si depende de un parámetro de la ruta (`groupStore(id)`).

En los dos casos, la página reparte los datos a componentes presentacionales (`ui/`) que solo tienen `input()` y
`output()`.

## Consecuencias

- Una tabla nueva se resuelve con `pagedQuery` y las columnas, un diálogo nuevo con su formulario dentro de
  `<app-form-dialog>`, y una acción nueva con `mutation()`. El comportamiento (errores, paginación, avisos) es el
  mismo en toda la app.
- Los diálogos ya no arrastran el estado de la vez anterior. Se acabó el bug de un error que seguía a la vista al
  reintentar.
- Las cuadrículas ya no vuelven al esqueleto al cambiar de página: conservan la anterior atenuada.
- Las piezas comunes tienen sus propias pruebas unitarias. Las páginas se prueban con los E2E.

## Alternativas descartadas

- **Que la página guarde lo que edita el diálogo** (diálogos 100 % presentacionales): habría que devolverle los
  errores de campo del 422 al formulario, que vive en el diálogo. La página acabaría dependiendo de sus internos.
- **NgRx Signal Store:** ya se descartó en el [ADR 0001](0001-angular-sin-zone-y-signals.md). Los stores de página
  con signals cubren lo mismo sin otra dependencia.
- **`MatDialog`/`DynamicDialog` (abrir componentes por código):** devolvería la apertura imperativa y la página
  perdería el control declarativo del ciclo de vida.
