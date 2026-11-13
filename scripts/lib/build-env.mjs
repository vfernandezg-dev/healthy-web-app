// Valor de una variable de compilación tal como la ve @ngx-env/builder: del entorno del proceso o, si no, de .env.
import { existsSync, readFileSync } from 'node:fs';

function fromDotEnv(name) {
  if (!existsSync('.env')) {
    return undefined;
  }
  const line = readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith(`${name}=`));
  return line?.slice(line.indexOf('=') + 1).trim();
}

/** El valor de `name` sin espacios alrededor, o undefined si no está definida o está vacía. */
export function buildEnv(name) {
  return process.env[name]?.trim() || fromDotEnv(name) || undefined;
}
