# ADR 0010 · Identidad visual «Despensa»

- **Estado:** aceptada
- **Fecha:** 2026-11-13
- **Sustituye en parte a:** [ADR 0002](0002-primeng-tailwind-y-tema.md) (los colores y la forma: la app ya no copia
  el tema de la landing)

## Contexto

La app estaba bien construida, pero se veía «muy blanca y verde» y genérica:

- **Una sola escala de color.** Todo salía de `brand` y `mint`; hasta los grises tiraban a verde.
- **Sin capas.** Tarjetas, menú y fondo eran blancos o casi blancos.
- **Rasgos de plantilla:**
  - tarjetas de 24 px y botones en píldora;
  - un icono en un cuadrado verde claro, repetido en cada tarjeta;
  - manchas difuminadas en el acceso;
  - pantallas de estado centradas y casi iguales;
  - una cuadrícula de «Accesos directos» que repetía el menú.
- **Colores copiados en tres sitios:** los tokens, el preset de PrimeNG y la landing. El logo solo existía en PNG.

## Decisión

**El verde de la marca pasa a ser estructura y el resto de la interfaz se apoya en neutros cálidos:**

- **Paleta** (`src/styles/tokens.css`, única fuente):
  - `stone`: neutros cálidos.
    - El fondo es papel (`canvas`) y las tarjetas son blancas con un filete (`line`), sin sombra.
    - El texto es `ink` y el secundario, `muted`.
  - `brand`: el verde del logo; `brand-700` es el color de acción.
  - `pine`: el menú lateral, la cabecera móvil y el panel del acceso, con texto `on-pine`.
  - `accent` (caqui): lo que pide atención sin ser un error (rachas, premios, Premium, la línea objetivo).
  - `saffron` (azafrán): VIP y avisos. `danger`: errores.
  - Los roles (`canvas`, `card`, `sunken`, `line`, `ink`, `muted`...) se usan antes que las escalas.
  - Con `--color-*: initial` no existe la paleta por defecto de Tailwind.
- **Una sola fuente de verdad:** el preset de PrimeNG lee esas mismas variables con `var()`, sin copiar hexadecimales.
- **`pnpm theme:check`**, que falla antes de los e2e, comprueba:
  - el contraste WCAG 2.2 AA de cada par de colores que usa la interfaz;
  - que existan las variables del preset;
  - que ninguna plantilla use un color de la paleta por defecto, un nombre retirado o un hexadecimal fuera del tema
    y de los gráficos.
- **Tipografía:** Plus Jakarta Sans en toda la interfaz. Los `h1` van en negrita con el espaciado ajustado y las
  cifras destacadas usan `.figure`. Se probó una serif editorial para titulares y cifras, y se descartó en la
  revisión.
- **Forma:**
  - radios de 8 px en los controles (`rounded-control`), 12 px en las tarjetas (`rounded-card`) y 6 px en las
    etiquetas (`rounded-badge`); nada de píldoras;
  - las sombras quedan solo para lo que flota (diálogos, menús, tooltips).
- **Logo:** un SVG en línea con `currentColor`, trazado del original, del que salen también el favicon y los iconos.
- **Composición, con piezas comunes:**
  - `app-page-header`: un antetítulo (la fecha en los inicios) y un filete bajo el `h1`;
  - `app-section-header`: el `h2` de una tarjeta y su enlace «Ver…»;
  - `app-stat-card` en un `.stat-ledger`: las cifras en una sola pieza separada por filetes;
  - `app-badge`, con 8 tonos, en lugar de `p-tag` y de las píldoras hechas a mano;
  - `app-status-panel`: las pantallas de estado, alineadas a la izquierda;
  - `app-sparkline`: la tendencia del peso sin librería de gráficos.
- **Movimiento** (`src/styles/motion.css`), solo con `prefers-reduced-motion: no-preference`:
  - las páginas se funden al entrar y las tarjetas suben escalonadas;
  - las barras se llenan y la tendencia se dibuja;
  - los botones se hunden al pulsarlos.
- **Textos** sin exclamaciones ni subtítulos genéricos.

## Consecuencias

- La app tiene una identidad propia y reconocible, y el contraste está comprobado par a par.
- Cambiar un color es cambiar un token: el preset de PrimeNG, los gráficos y las utilidades lo siguen solos.
- Un color nuevo exige darlo de alta en `tokens.css` y, si es para texto o un elemento gráfico, añadir su par en
  `theme:check`.
- Se borraron `shortcuts.ts`, `NavItem.description`, los tokens de `tag` y `avatar` de PrimeNG y
  `tailwindcss-primeui`. El CSS quedó en 43,5 kB y el JS inicial bajó un poco.
- La landing mantiene su propio diseño. Comparte el logo, la foto y las políticas, pero no estos tokens.

## Alternativas descartadas

- **Otro verde más saturado o un modo oscuro como identidad:** seguía siendo «blanco y verde» o cambiaba el problema
  de sitio.
- **Una serif editorial en titulares y cifras:** daba carácter, pero no encajaba con el resto de la interfaz.
- **Mantener `p-tag` con un preset más fino:** los tonos de la marca no encajan en las severidades de PrimeNG, y
  `app-badge` pesa menos.
