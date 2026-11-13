# Guía del frontend

Cómo se escribe código en esta app. Las decisiones de fondo están en los [ADR](adr/README.md). Esta guía es la
versión práctica: dónde va cada cosa y qué pieza usar para cada caso. `pnpm verify` comprueba casi todo lo que se
describe aquí.

## Estructura

```text
src/app/
  core/          Únicos en la app: api (config, ProblemDetail, interceptor de errores, tipos generados),
                 auth (sesión, interceptor, guards), routing (título, navegación, salidas externas),
                 theme, ui (Toaster, Confirmer).
  shared/        Piezas sin estado de negocio: forms, table, ui, utils, pipes, i18n, media, charts, publishing.
  layout/        app-shell, auth-layout, not-found.
  features/<f>/
    data/        <f>-api.ts (único dueño de sus endpoints), stores de página, tipos y funciones puras.
    ui/          Componentes presentacionales: solo input()/output()/model(); nunca inyectan una API.
    <rol>/ o raíz  Páginas y diálogos: los contenedores.
    <f>.routes.ts
```

- Fuera de la propia carpeta se importa con alias (`@core/…`, `@shared/…`, `@layout/…`, `@features/…`); dentro, con
  rutas relativas de un nivel como mucho.
- De otra funcionalidad solo se importa su `data/`. Si algo de `ui/` hace falta en dos funcionalidades, sube a
  `shared/ui`.
- ESLint impide lo demás ([ADR 0007](adr/0007-capas-alias-y-fronteras.md)).

## Componentes

- Standalone y `OnPush`, que es lo que da Angular 22 por defecto: no hace falta escribirlo.
- Entradas y salidas con `input()`, `input.required()`, `output()` y `model()`. Consultas con `viewChild()`. Nunca
  decoradores.
- Dependencias con `inject()` en los campos; no se inyecta en el constructor.
- Plantillas con control de flujo (`@if`, `@for` con `track`, `@switch`, `@defer`, `@let`).
  - `ngTemplateOutlet` se usa con la sintaxis de propiedades, nunca con `*`.
- Plantilla en línea solo si tiene menos de 40 líneas; si no, va en su `.html`.
  - En las plantillas en línea, nada de template literals con backticks escapados: calcula esa cadena en la clase.
- Textos de la interfaz en español y nombres de código en inglés.
- **Contenedor o presentacional:**
  - Una página o un diálogo inyecta servicios y orquesta.
  - Un componente de `ui/` recibe datos y emite eventos.
  - Si un componente presentacional necesita pedir algo a la API, no es presentacional: es un contenedor (como
    `CommentThread`).

## Estilo visual

La identidad «Despensa» está en el [ADR 0010](adr/0010-identidad-despensa.md) y sus valores en
`src/styles/tokens.css`. `pnpm theme:check` rechaza lo que se salga de aquí.

- **Colores: primero el rol, después la escala.** Nunca hexadecimales ni la paleta por defecto de Tailwind, que no
  existe (`--color-*: initial`).

  | Para                                    | Usa                                                      |
  | --------------------------------------- | -------------------------------------------------------- |
  | Fondo de la página                      | `bg-canvas` (ya lo pone `body`)                          |
  | Tarjeta                                 | `.card` (blanca, filete, `rounded-card`)                 |
  | Zona hundida dentro de una tarjeta      | `bg-sunken` con `border-line`                            |
  | Filetes, separadores de listas y tablas | `border-line`, `divide-line`; más marcado, `line-strong` |
  | Texto y texto secundario                | `text-ink` (por defecto) y `text-muted`                  |
  | Enlaces y acción principal              | `text-brand-700`; botones de PrimeNG                     |
  | Menú y paneles de marca                 | `bg-pine` con `text-on-pine` y la clase `.hb-on-pine`    |
  | Atención sin error (rachas, premios)    | `accent`: relleno 600, texto 700                         |
  | Avisos y VIP                            | `saffron`                                                |
  | Errores                                 | `text-danger-700`                                        |

- **Un color nuevo** se da de alta en `tokens.css`. Si es para texto o un elemento gráfico, su par va en `PAIRS`
  de `scripts/check-theme-tokens.mjs`, que comprueba el contraste.
- **Tipografía:** Plus Jakarta Sans.
  - Los `h1` ya llevan peso y espaciado por la regla base; cada página solo pone el tamaño.
  - Las cifras destacadas usan `.figure`.
  - Los `h2` de tarjeta van en `text-base font-semibold`, mejor con `app-section-header`.
- **Radios:** `rounded-control` (8 px) en controles, `rounded-card` (12 px) en tarjetas y zonas, `rounded-badge`
  (6 px) en etiquetas. Nada de píldoras; `rounded-full` solo para avatares, barras e indicadores.
- **Sombras** solo en lo que flota (diálogos, menús, tooltips: `shadow-overlay`). Las tarjetas no llevan.
- **Piezas comunes:**
  - `app-page-header`: antetítulo, `h1` y acciones;
  - `app-section-header`: el `h2` de una tarjeta con su enlace «Ver…»;
  - `app-stat-card` dentro de `.stat-ledger`: cifras;
  - `app-badge`: etiquetas, con los mapas `*_TONE` de `labels.ts`;
  - `app-status-panel`: pantallas de estado;
  - `app-empty-state` y `app-load-error`: vacío y error;
  - `app-progress-bar`: avance, con `tone="accent"` en las rachas.
- **Movimiento** (`src/styles/motion.css`):
  - `.card` ya entra subiendo; las rejillas y listas llevan `.hb-stagger`;
  - para otras piezas hay utilidades `motion-safe:animate-rise`, `-fade`, `-grow-x`, `-draw`, `-pop` y `-settle`;
  - todo desaparece con el movimiento reducido, que es lo que emulan los e2e;
  - nada de animaciones que hagan esperar.
- **Textos:** sin exclamaciones ni subtítulos de relleno. Los nombres de regiones y encabezados los usan los e2e:
  si cambian, cambian las pruebas.

## Estado

| Necesitas                                                                  | Usa                                                                   |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Un valor derivado                                                          | `computed`                                                            |
| Estado que se reinicia cuando cambia otro (la página al cambiar un filtro) | `linkedSignal`                                                        |
| Leer de la API                                                             | `httpResource` en el servicio de `data/` (los parámetros son signals) |
| Un listado paginado (tabla o cuadrícula)                                   | `pagedQuery()` + `<p-table>` o `<app-paged-grid>`                     |
| Una lista con «Ver más»                                                    | `loadMore()` + `<app-load-more-footer>`                               |
| Una búsqueda mientras se escribe                                           | `debouncedSearch(filtros, 'q')`                                       |
| Escribir en la API (publicar, borrar...)                                   | `mutation()`                                                          |
| Enviar un formulario                                                       | `formSubmitter()`                                                     |
| Varios recursos y escrituras en una página                                 | un store de página (ver abajo)                                        |
| Un flujo en el tiempo (debounce, progreso de una subida)                   | RxJS, con `takeUntilDestroyed()`                                      |

- `effect()` solo para efectos fuera de Angular (el título de la pestaña). Nunca para copiar un signal en otro.
- `resource.value()` lanza si el recurso está en error: pregunta antes por `hasValue()`.
- **Stores de página:**
  - Una clase `@Injectable()` en `providers` de la página si no depende de inputs (`ProgressStore`).
  - Una función que se llama en el contexto de inyección si depende de un parámetro de la ruta
    (`groupStore(this.id)`).

## Formularios

- Signal Forms (`@angular/forms/signals`). Nada de `FormsModule` ni `ReactiveFormsModule`: el lint lo prohíbe.
  - Los filtros de un listado también son un `form()`, con `[formField]`.
- El esquema va en un `schema()` exportado, con los mismos límites que valida la API (`maxLength`, `min`...).
  - `maxlength` y `min` no se ponen como atributos: los pone `[formField]` a partir del esquema.
- Los campos van dentro de `<app-field>` (etiqueta, ayuda y error enlazados con `aria-describedby`).
- Envío:

  ```ts
  protected save(event: Event): Promise<void> {
    return this.submitForm(event, this.form, {
      failure: this.failure,                       // en un diálogo; sin él, el error sale en un aviso
      codeFields: { 'email-taken': this.form.email }, // códigos de la API que son de un campo
      save: () => this.api.create(requestOf(this.model())),
      onSuccess: (created) => { /* avisar, navegar, cerrar */ },
    });
  }
  ```

- Las escrituras de un formulario llevan `silentErrors()` en el servicio: su error lo muestra el formulario, no el
  interceptor.

## Diálogos

1. La página guarda un `dialogState<T>()` y lo pinta así:

   ```html
   @defer (when groupDialog.isOpen(); prefetch on idle) { @if (groupDialog.data(); as dialog) {
   <app-group-dialog [group]="dialog.value" (saved)="…" (closed)="groupDialog.close()" />
   } }
   ```

2. El diálogo recibe por `input()` lo que edita y crea su modelo con `linkedSignal(() => modelOf(this.x()))`.
3. Su plantilla va dentro de `<app-form-dialog [(open)]="open" … (closed)="closed.emit()">`.
4. Al guardar, emite `saved` y hace `open.set(false)`.

([ADR 0008](adr/0008-dialogos-declarativos-y-stores-de-pagina.md))

## Escrituras

```ts
protected readonly archive = mutation(() => this.api.archive(this.id()), {
  confirm: { header: 'Archivar', message: '…', acceptLabel: 'Archivar', danger: true },
  success: 'Archivado',                     // o { summary, detail, severity: 'info' }
  onSuccess: (item) => this.detail.set(item),
});
```

- En la plantilla: `[loading]="archive.pending()" (click)="archive.run()"`.
- Para el botón de un elemento concreto de una lista: `[loading]="start.running()?.[0] === reward"`.
- Los errores ya los avisa el interceptor; `run()` nunca lanza.

## Listados

```ts
private readonly filterModel = signal<UserFilters>({ q: '', role: null });
protected readonly filters = form(this.filterModel);
protected readonly users = pagedQuery({
  filters: debouncedSearch(this.filterModel, 'q'),
  defaultSort: 'createdAt,desc',
  pageSize: PAGE_SIZE.table,
  load: (request) => this.api.users(request),
});
```

- **Tamaños de página** en `PAGE_SIZE`: tabla 20, cuadrícula 12, lista 20, publicaciones 10, opciones 100.
- **El servicio recibe `Signal<Filtros & PageRequest>`** y lo convierte con `pageParams(page, filtros)`, que no envía
  los filtros vacíos.
- **Con p-table:**
  - enlaza `[value]="users.items()"`, `[first]="users.first()"`, `[rows]="users.pageSize"`,
    `[totalRecords]="users.total()"`, `[loading]="users.loading()"` y `(onLazyLoad)="users.onLazyLoad($event)"`;
  - tipa la fila con `<ng-template #body let-user [appRow]="users.items()">`.
- **Tras crear o borrar:** `users.afterCreate()` o `users.afterRemove()`.

## Seguridad

- **Sin `innerHTML`, `bypassSecurityTrust*` ni manipulación directa del DOM.**
- **Salidas de la app por `ExternalNavigation`:** `toPayPal()` y `openApiTab()`/`apiUrlOf()`, que validan el
  destino.
- **El access token nunca sale de memoria** ([ADR 0003](adr/0003-sesion-en-memoria.md)).
- **CSP y cabeceras en `vercel.json`:** los E2E fallan ante una violación
  ([ADR 0009](adr/0009-csp-y-cabeceras-de-seguridad.md)). Antes de añadir un dominio externo (una API, un CDN,
  imágenes), añádelo a la CSP.

## Pruebas

- **Unitarias (Vitest):**
  - las piezas de `shared/` y las funciones puras de `data/`;
  - los recursos se prueban con `resource()` y `TestBed.tick()`.
- **E2E (Playwright, API simulada):**
  - las pruebas importan `test` y `expect` de `./support/test`, que añade la comprobación de la CSP;
  - el cuerpo de una petición se lee con `requestBody<T>(route)`, tipado con el contrato.
- **Full-stack:** `pnpm test:e2e:fullstack` contra la API real (ver `e2e-fullstack/README.md`).
- **`pnpm verify`:** lint, tipos de los E2E, formato, contrato, tokens del tema, unitarias y build.
