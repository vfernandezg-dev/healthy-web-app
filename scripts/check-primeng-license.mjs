// Antes de un build de release: falla si no hay clave de licencia de PrimeNG (sin ella, la app publicada
// mostraría el aviso "Invalid PrimeUI License"). La busca como @ngx-env: en el entorno o en .env.
import { existsSync, readFileSync } from 'node:fs';

const NAME = 'NG_APP_PRIMENG_LICENSE_KEY';

function fromDotEnv() {
  if (!existsSync('.env')) {
    return undefined;
  }
  const line = readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith(`${NAME}=`));
  return line?.slice(line.indexOf('=') + 1).trim();
}

const key = process.env[NAME]?.trim() || fromDotEnv();

if (!key) {
  console.error(
    `Falta ${NAME}: el build de release necesita la clave de la licencia Community de PrimeNG ` +
      '(https://primeui.dev). Ponla en .env o, en CI, en el secreto PRIMENG_LICENSE_KEY.',
  );
  process.exit(1);
}
console.warn('Clave de licencia de PrimeNG presente.');
