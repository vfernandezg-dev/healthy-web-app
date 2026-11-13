// Comprobaciones del tema (`pnpm theme:check`, parte de `pnpm verify`):
//
// 1. El preset de PrimeNG (src/app/core/theme/aura-lean.ts) trae los tokens de todos los componentes de PrimeNG que
//    importa la app. Un componente sin sus tokens se pinta sin estilos.
// 2. Los pares de colores que usa la interfaz (src/styles/tokens.css) tienen el contraste de WCAG 2.2 AA: 4,5:1 para
//    texto y 3:1 para elementos gráficos (bordes de foco, indicadores, líneas de gráficos). Los e2e lo comprueban con
//    axe página a página; esto falla antes y documenta qué combinaciones están permitidas.
// 3. Cada variable CSS que referencia el preset de la marca existe en tokens.css.
//
// `node scripts/check-theme-tokens.mjs --verbose` imprime la tabla de contrastes.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const AURA_LEAN = 'src/app/core/theme/aura-lean.ts';
const BRAND_PRESET = 'src/app/core/theme/healthy-bites.preset.ts';
const TOKENS = 'src/styles/tokens.css';

const problems = [];

// ---------------------------------------------------------------------------------------------- 1. tokens de PrimeNG

/** Tokens que necesita cada módulo de PrimeNG (el suyo y los de los componentes que pinta dentro). */
const NEEDS = {
  api: [],
  config: [],
  avatar: ['avatar'],
  button: ['button'],
  confirmdialog: ['confirmdialog', 'dialog', 'button'],
  dialog: ['dialog', 'button'],
  drawer: ['drawer', 'button'],
  iconfield: ['iconfield'],
  inputicon: ['iconfield'],
  inputnumber: ['inputnumber', 'inputtext'],
  inputtext: ['inputtext'],
  message: ['message'],
  paginator: ['paginator'],
  progressspinner: ['progressspinner'],
  select: ['select'],
  selectbutton: ['selectbutton', 'togglebutton'],
  skeleton: ['skeleton'],
  slider: ['slider'],
  table: ['datatable', 'paginator'],
  tabs: ['tabs'],
  textarea: ['textarea'],
  toast: ['toast', 'button'],
};

function sources(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return sources(path);
    }
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') ? [path] : [];
  });
}

const used = new Set();
for (const file of sources('src/app')) {
  for (const match of readFileSync(file, 'utf8').matchAll(/from 'primeng\/([a-z]+)'/g)) {
    used.add(match[1]);
  }
}

const auraLean = readFileSync(AURA_LEAN, 'utf8');
const available = new Set(
  [...auraLean.matchAll(/from '@primeuix\/themes\/aura\/([a-z]+)'/g)].map((match) => match[1]),
);

for (const module of [...used].sort()) {
  const needs = NEEDS[module];
  if (!needs) {
    problems.push(
      `primeng/${module}: no está en NEEDS (scripts/check-theme-tokens.mjs). Añade qué tokens usa.`,
    );
    continue;
  }
  for (const token of needs) {
    if (!available.has(token)) {
      problems.push(`primeng/${module}: faltan los tokens «${token}» en ${AURA_LEAN}.`);
    }
  }
}

// ---------------------------------------------------------------------------------------------- 2. contraste

/** Variables de tokens.css (`--nombre: valor;`), sin comentarios. */
const declared = new Map(
  [
    ...readFileSync(TOKENS, 'utf8')
      .replaceAll(/\/\*[\s\S]*?\*\//g, '')
      .matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g),
  ].map((match) => [match[1], match[2].trim()]),
);

/** Valor final de una variable, siguiendo las referencias var(--otra). */
function resolve(name, seen = []) {
  const value = declared.get(name);
  if (value === undefined) {
    throw new Error(`--${name} no está en ${TOKENS}${seen.length ? ` (desde --${seen[0]})` : ''}`);
  }
  const reference = /^var\(--([a-z0-9-]+)\)$/.exec(value);
  return reference ? resolve(reference[1], [...seen, name]) : value;
}

/** Luminancia relativa de un color #rgb o #rrggbb (WCAG 2.x). */
function luminance(hex) {
  const digits = hex.replace('#', '');
  const full = digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits;
  if (!/^[0-9a-f]{6}$/i.test(full)) {
    throw new Error(`color no válido: ${hex}`);
  }
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(full.slice(i, i + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// La fórmula se comprueba a sí misma antes de juzgar la paleta.
const selfTest = [
  ['#000000', '#ffffff', 21],
  ['#777777', '#ffffff', 4.48],
];
for (const [a, b, expected] of selfTest) {
  const got = Math.round(contrast(a, b) * 100) / 100;
  if (got !== expected) {
    problems.push(
      `El cálculo de contraste falla: ${a} sobre ${b} da ${got} y debería dar ${expected}.`,
    );
  }
}

const TEXT = 4.5;
const UI = 3;

/**
 * Pares permitidos: [primer plano, fondo, mínimo, uso]. Nombres de tokens.css sin `--color-`. Si un componente
 * necesita una combinación nueva, se añade aquí.
 */
const PAIRS = [
  // Texto sobre las superficies.
  ['ink', 'canvas', TEXT, 'texto sobre el papel'],
  ['ink', 'card', TEXT, 'texto en tarjetas'],
  ['muted', 'canvas', TEXT, 'texto secundario sobre el papel'],
  ['muted', 'card', TEXT, 'texto secundario en tarjetas'],
  ['muted', 'sunken', TEXT, 'texto secundario en zonas hundidas'],
  ['muted', 'brand-50', TEXT, 'texto secundario sobre verde claro'],
  ['stone-500', 'card', TEXT, 'placeholder de los campos (solo blancos)'],
  // Verde de acción.
  ['brand-700', 'canvas', TEXT, 'enlaces sobre el papel'],
  ['brand-700', 'card', TEXT, 'enlaces en tarjetas'],
  ['card', 'brand-700', TEXT, 'botón principal'],
  ['card', 'brand-800', TEXT, 'botón principal al pasar por encima'],
  ['brand-800', 'brand-50', TEXT, 'mensajes de éxito, etiquetas positivas'],
  ['brand-950', 'brand-100', TEXT, 'selección de texto, opción resaltada'],
  // Estructura en pino.
  ['on-pine', 'pine', TEXT, 'texto del menú lateral'],
  ['on-pine', 'pine-raised', TEXT, 'elemento activo del menú'],
  ['on-pine-muted', 'pine', TEXT, 'texto secundario del menú'],
  ['on-pine-muted', 'pine-raised', TEXT, 'texto secundario sobre elemento activo'],
  ['saffron-200', 'pine', TEXT, 'etiqueta VIP'],
  // Caqui, azafrán y errores.
  ['accent-700', 'canvas', TEXT, 'texto de aviso sobre el papel'],
  ['accent-700', 'card', TEXT, 'texto de aviso en tarjetas'],
  ['card', 'accent-600', TEXT, 'texto blanco sobre relleno caqui'],
  ['accent-800', 'accent-50', TEXT, 'etiqueta caqui'],
  ['saffron-800', 'saffron-50', TEXT, 'etiqueta y mensaje de aviso'],
  ['saffron-800', 'card', TEXT, 'texto de aviso en tarjetas'],
  ['accent-600', 'card', UI, 'icono de racha'],
  ['danger-700', 'card', TEXT, 'texto de error'],
  ['danger-700', 'canvas', TEXT, 'texto de error sobre el papel'],
  ['danger-800', 'danger-50', TEXT, 'mensaje de error'],
  ['card', 'danger-700', TEXT, 'botón de peligro'],
  ['stone-700', 'stone-100', TEXT, 'etiqueta neutra'],
  ['brand-900', 'brand-100', TEXT, 'avatar y etiqueta verdes'],
  ['accent-900', 'accent-100', TEXT, 'avatar y etiqueta caqui'],
  ['saffron-900', 'saffron-100', TEXT, 'avatar y etiqueta de aviso'],
  ['stone-800', 'stone-200', TEXT, 'avatar y etiqueta neutros'],
  ['danger-800', 'danger-100', TEXT, 'etiqueta de error'],
  ['saffron-300', 'pine', TEXT, 'etiqueta VIP (azafrán sobre pino)'],
  ['stone-700', 'card', TEXT, 'etiqueta con contorno en tarjetas'],
  ['stone-700', 'canvas', TEXT, 'etiqueta con contorno sobre el papel'],
  ['stone-700', 'stone-200', TEXT, 'opción de un selector segmentado'],
  ['muted', 'stone-50', TEXT, 'cabecera de tabla'],
  // Elementos gráficos.
  ['brand-600', 'canvas', UI, 'contorno de foco'],
  ['brand-600', 'card', UI, 'contorno de foco en tarjetas'],
  ['brand-300', 'pine', UI, 'contorno de foco en el menú'],
  ['accent-400', 'pine-raised', UI, 'indicador del elemento activo del menú'],
  ['accent-500', 'card', UI, 'línea objetivo del gráfico'],
  ['brand-700', 'brand-100', UI, 'barra de avance'],
  ['accent-600', 'accent-100', UI, 'barra de avance de una racha'],
];

const rows = [];
for (const [foreground, background, minimum, usage] of PAIRS) {
  try {
    const ratio = contrast(resolve(`color-${foreground}`), resolve(`color-${background}`));
    const ok = ratio >= minimum;
    rows.push(
      `${ok ? '  ' : '✗ '}${ratio.toFixed(2).padStart(5)}  ${foreground} / ${background} — ${usage}`,
    );
    if (!ok) {
      problems.push(
        `Contraste ${ratio.toFixed(2)}:1 de ${foreground} sobre ${background} (${usage}); mínimo ${minimum}:1.`,
      );
    }
  } catch (error) {
    problems.push(error.message);
  }
}

// ---------------------------------------------------------------------------------------------- 3. referencias del preset

const brandPreset = readFileSync(BRAND_PRESET, 'utf8');
const referenced = new Set([
  ...[...brandPreset.matchAll(/var\(--([a-z0-9-]+)\)/g)].map((match) => match[1]),
  ...[...brandPreset.matchAll(/\bv\('([a-z0-9-]+)'\)/g)].map((match) => match[1]),
  ...[...brandPreset.matchAll(/\bscale\('([a-z]+)'\)/g)].flatMap((match) =>
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
      (step) => `color-${match[1]}-${step}`,
    ),
  ),
]);
for (const name of [...referenced].sort()) {
  if (!declared.has(name)) {
    problems.push(`${BRAND_PRESET} usa --${name}, que no está en ${TOKENS}.`);
  }
}

if (problems.length > 0) {
  console.error(rows.join('\n'));
  console.error(`\n${problems.join('\n')}`);
  process.exit(1);
}
if (process.argv.includes('--verbose')) {
  console.warn(rows.join('\n'));
}
console.warn(
  `Tokens del tema completos para ${used.size} módulos de PrimeNG; ${PAIRS.length} pares de colores con contraste suficiente; ${referenced.size} variables del preset definidas.`,
);
