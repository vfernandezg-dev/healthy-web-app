// Antes de un build de release: falla si no hay clave de licencia de PrimeNG (sin ella, la app publicada
// mostraría el aviso "Invalid PrimeUI License"). La busca como @ngx-env: en el entorno o en .env.
import { buildEnv } from './lib/build-env.mjs';

const NAME = 'NG_APP_PRIMENG_LICENSE_KEY';

if (!buildEnv(NAME)) {
  console.error(
    `Falta ${NAME}: el build de release necesita la clave de la licencia Community de PrimeNG ` +
      '(https://primeui.dev). Ponla en .env o, en CI, en el secreto PRIMENG_LICENSE_KEY.',
  );
  process.exit(1);
}
console.warn('Clave de licencia de PrimeNG presente.');
