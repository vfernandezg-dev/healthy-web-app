// Sirve el build de producción para los tests E2E, con la misma regla que el hosting: cualquier ruta
// sin fichero devuelve index.html (la app resuelve la ruta). Las peticiones a la API las simula
// Playwright con page.route, así que aquí nunca llegan. Uso: node scripts/serve-dist.mjs [puerto]
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';

const ROOT = resolve('dist/healthybites-app/browser');
const PORT = Number(process.argv[2] ?? 4300);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

async function resolveFile(pathname) {
  const candidate = normalize(join(ROOT, decodeURIComponent(pathname)));
  if (candidate !== ROOT && !candidate.startsWith(ROOT + sep)) {
    return null;
  }
  try {
    const info = await stat(candidate);
    return info.isDirectory() ? join(candidate, 'index.html') : candidate;
  } catch {
    // Rutas de la aplicación (sin extensión): index.html. Ficheros que no existen: 404.
    return extname(candidate) ? null : join(ROOT, 'index.html');
  }
}

createServer(async (request, response) => {
  const { pathname } = new URL(request.url ?? '/', 'http://localhost');
  const file = await resolveFile(pathname);
  if (!file) {
    response.writeHead(404).end();
    return;
  }
  try {
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
}).listen(PORT, () => console.warn(`dist/ servido en http://localhost:${PORT}`));
