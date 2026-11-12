// Genera los tipos TypeScript del contrato OpenAPI (src/app/core/api/schema.d.ts).
//   pnpm api:gen    escribe el fichero
//   pnpm api:check  falla si el fichero commiteado no coincide con el contrato (lo usa CI)
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import openapiTS, { astToString } from 'openapi-typescript';

const SPEC = new URL('../src/app/core/api/openapi.yaml', import.meta.url);
const OUTPUT = new URL('../src/app/core/api/schema.d.ts', import.meta.url);
const HEADER =
  '// Generado con `pnpm api:gen` a partir de openapi.yaml (openapi-typescript). No lo edites a mano.\n\n';

const ast = await openapiTS(SPEC, {
  // Cada esquema también como tipo propio: import type { SessionResponse } from '.../schema'.
  rootTypes: true,
  rootTypesNoSchemaPrefix: true,
});
const generated = HEADER + astToString(ast);

if (process.argv.includes('--check')) {
  const current = existsSync(OUTPUT) ? readFileSync(OUTPUT, 'utf8').replaceAll('\r\n', '\n') : '';
  if (current !== generated) {
    console.error(
      'src/app/core/api/schema.d.ts no coincide con openapi.yaml: ejecuta `pnpm api:gen` y commitea el resultado.',
    );
    process.exit(1);
  }
  console.warn('Tipos de la API al día.');
} else {
  writeFileSync(OUTPUT, generated);
  console.warn('Tipos generados en src/app/core/api/schema.d.ts.');
}
