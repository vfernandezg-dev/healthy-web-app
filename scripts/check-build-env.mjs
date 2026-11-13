// Después del build: comprueba que @ngx-env/builder sustituyó las variables NG_APP_ en el bundle.
// Solo sustituye la expresión completa `import.meta.env?.NG_APP_X`; si el código lee el objeto `import.meta.env`
// (o un alias suyo), el navegador recibe undefined y la app usa los valores por defecto sin avisar.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildEnv } from './lib/build-env.mjs';

const OUTPUT = 'dist/healthybites-app/browser';
const ACCESS = /import\.meta\.env(?:\?\.|\.)?([A-Za-z_$][\w$]*)?/g;

const problems = [];
for (const file of readdirSync(OUTPUT).filter((name) => name.endsWith('.js'))) {
  const code = readFileSync(join(OUTPUT, file), 'utf8');
  for (const [expression, name] of code.matchAll(ACCESS)) {
    if (!name?.startsWith('NG_APP_')) {
      problems.push(
        `${file}: «${expression}» lee el objeto import.meta.env, que no existe en el navegador.`,
      );
    } else if (buildEnv(name)) {
      problems.push(`${file}: ${name} está definida pero no se sustituyó («${expression}»).`);
    }
  }
}

if (problems.length > 0) {
  console.error(['Variables de compilación sin sustituir en el bundle:', ...problems].join('\n  '));
  process.exit(1);
}
console.warn('Variables de compilación sustituidas en el bundle.');
