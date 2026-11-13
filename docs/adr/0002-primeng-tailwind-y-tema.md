# ADR 0002 · PrimeNG + Tailwind CSS con el tema de la landing

- **Estado:** aceptada, sustituida en parte por el [ADR 0010](0010-identidad-despensa.md) (colores y forma)
- **Fecha:** 2026-11-11

## Contexto

La versión 1 mezclaba Angular Material, Bootstrap y Font Awesome por CDN, con cuatro paletas distintas. La landing
ya tiene una identidad cerrada (verdes de marca, menta, Plus Jakarta Sans, tarjetas redondeadas) hecha con Tailwind
CSS 4.

Hacían falta componentes complejos accesibles (tablas con orden y paginación en el servidor, desplegables,
diálogos, avisos, pestañas, cajón lateral) sin escribirlos desde cero.

## Decisión

- **PrimeNG 22** en modo _styled_, con un **preset propio sobre Aura** (`core/theme/healthy-bites.preset.ts`): la
  escala `primary` es la de la marca, el color de acción es brand-700 (6:1 con blanco) y el foco brand-600. Los
  tonos de los botones de severidad, los avisos y las etiquetas se ajustan donde Aura no llega a contraste AA.
- **Solo los tokens de los componentes que se usan** (`core/theme/aura-lean.ts`): el preset completo trae 95
  componentes y suma unos 70 kB al bundle inicial. `pnpm theme:check` falla si se usa un componente sin sus tokens.
- **Tailwind CSS 4** para la maquetación, con los mismos tokens que la landing (`src/styles/tokens.css`) y
  `tailwindcss-primeui` para usar los colores del tema en las utilidades. Las capas CSS van en este orden:
  theme, base, primeng, components y utilities (las utilidades de Tailwind ganan a los estilos de PrimeNG).
- **Lucide** para los iconos (un componente por icono), también dentro de los botones de PrimeNG. No se carga la
  fuente de iconos de PrimeNG.
- **Licencia Community de PrimeNG** (gratuita). La clave va en `NG_APP_PRIMENG_LICENSE_KEY` y en el secreto de CI.
  Se renueva cada 12 meses.

## Consecuencias

- La app y la landing se ven como un mismo producto, y un solo cambio de token se nota en las dos.
- PrimeNG 22 ya no es MIT: hace falta renovar la clave cada año, y sin ella aparece un aviso de licencia.
- Algunos componentes de PrimeNG 22 traen fallos de accesibilidad (la X de `p-confirmdialog` sin nombre,
  `p-progressbar` con ARIA inválido): se evitan o se sustituyen por componentes propios, y axe lo vigila.
- Las tablas no tienen modo apilado en PrimeNG 22: cada fila lleva una celda en formato ficha para móvil.

## Alternativas descartadas

- **Angular Material:** su sistema de temas no encaja con la identidad de la landing sin sobrescribir mucho, y no
  trae tabla con orden y paginación en el servidor tan completa.
- **Solo Tailwind con componentes propios o headless:** más control, pero diálogos, desplegables y tablas
  accesibles llevan mucho trabajo y mantenimiento.
- **PrimeNG en modo unstyled:** obligaría a dar estilo a cada componente desde cero; el preset consigue lo mismo
  con mucho menos código.
