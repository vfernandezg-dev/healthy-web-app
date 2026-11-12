# ADR 0007 · Capas, alias y fronteras comprobadas por ESLint

- **Estado:** aceptada
- **Fecha:** 2026-11-12

## Contexto

La estructura por funcionalidades (`core`, `shared`, `layout`, `features/*`) existía desde la versión 2.0, pero solo
por convención:

- Los imports eran relativos, de hasta `../../../`, así que no se veía de qué capa venía cada cosa.
- Nada impedía que `core` dependiera de `shared` o que una funcionalidad usara las páginas de otra. Ya había un caso:
  el resumen de admin importaba `Shortcuts` del panel de inicio.
- Dentro de cada funcionalidad, `shared/` mezclaba componentes con funciones de dominio.

## Decisión

- **Alias por capa** en `tsconfig.json`: `@core/*`, `@shared/*`, `@layout/*` y `@features/*`. Fuera de la propia
  carpeta se importa con alias; dentro, con rutas relativas.
- **Dependencias permitidas:**
  - `core` solo usa librerías y `core`.
  - `shared` usa `core` y `shared`.
  - `layout` usa `core` y `shared`.
  - Una funcionalidad usa `core`, `shared`, sus propias carpetas y el `data/` de otra funcionalidad (su API, sus
    modelos y sus funciones puras). Nunca sus páginas ni sus componentes.
- **Cada funcionalidad se organiza así:**
  - `data/`: el servicio de la API (el único dueño de sus endpoints), los stores de página, los tipos y las funciones
    puras.
  - `ui/`: los componentes presentacionales.
  - Las páginas y los diálogos (los contenedores) van en la raíz de la funcionalidad o en una carpeta por rol.
- **ESLint lo comprueba** con `no-restricted-imports` por carpeta (ver `eslint.config.mjs`). También prohíbe los
  imports relativos de más de un nivel, `FormsModule`/`ReactiveFormsModule` y `MessageService`/`ConfirmationService`
  fuera de `core/ui`.
- **El mismo rigor en TypeScript y en el lint.**
  - TypeScript: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `strictStandalone`,
    `typeCheckHostBindings`, y los diagnósticos extendidos como errores.
  - ESLint con información de tipos: `no-floating-promises`, `no-deprecated`, `no-unnecessary-condition`,
    `switch-exhaustiveness-check`, etc.
  - Las pruebas E2E también se comprueban (`pnpm typecheck:e2e`).

## Consecuencias

- Una dependencia indebida falla en `pnpm lint` (y en CI) en lugar de descubrirse al reorganizar.
- Lo que comparten varias funcionalidades sube a `shared/` (como `Shortcuts`, `Paywall` o `PersonCell`) o se publica
  en su `data/` (como `streakPercent` en `rewards/data`).
- `no-deprecated` encontró APIs deprecadas que nadie había visto: `withFetch`, `reportProgress`, `pButtonLabel`,
  `pButtonIcon` y tres iconos de Lucide renombrados.
- `tsconfig.app.json` incluye todo `src` (salvo los specs), así que también se comprueban los tipos y el lint de un
  fichero que todavía no se usa.

## Alternativas descartadas

- **`eslint-plugin-boundaries`:** expresa lo mismo, pero añade una dependencia y su configuración.
  `no-restricted-imports` con los alias basta.
- **Nx con librerías por capa:** demasiada estructura para una aplicación de este tamaño.
