// Copia el contrato OpenAPI de la API (repositorio hermano) y anota de qué commit sale.
// Después, `pnpm api:gen` regenera los tipos. Uso: pnpm api:sync  (API_REPO=ruta para otro sitio)
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const apiRepo = resolve(process.env.API_REPO ?? '../Healthy_bites-api');
const source = resolve(apiRepo, 'docs/openapi.yaml');

if (!existsSync(source)) {
  console.error(`No encuentro ${source}. Define API_REPO con la ruta del repositorio de la API.`);
  process.exit(1);
}

const git = (...args) => execFileSync('git', ['-C', apiRepo, ...args], { encoding: 'utf8' }).trim();
const commit = git('rev-parse', 'HEAD');
const modified = git('status', '--porcelain', '--', 'docs/openapi.yaml') !== '';

copyFileSync(source, 'src/app/core/api/openapi.yaml');
writeFileSync(
  'src/app/core/api/openapi.source.json',
  `${JSON.stringify({ repository: 'healthybites-backend', commit, modified }, null, 2)}\n`,
);

console.warn(
  `Contrato copiado de healthybites-backend@${commit.slice(0, 7)}` +
    (modified ? ' (con cambios sin commitear en la API)' : '') +
    '.',
);
