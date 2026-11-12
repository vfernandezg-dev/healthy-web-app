// Comprueba que el preset de PrimeNG (src/app/core/theme/aura-lean.ts) trae los tokens de todos los componentes
// de PrimeNG que importa la app. Un componente sin sus tokens se pinta sin estilos.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const PRESET = 'src/app/core/theme/aura-lean.ts';

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
  tag: ['tag'],
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

const preset = readFileSync(PRESET, 'utf8');
const available = new Set(
  [...preset.matchAll(/from '@primeuix\/themes\/aura\/([a-z]+)'/g)].map((match) => match[1]),
);

const problems = [];
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
      problems.push(`primeng/${module}: faltan los tokens «${token}» en ${PRESET}.`);
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.warn(`Tokens del tema completos para ${used.size} módulos de PrimeNG.`);
