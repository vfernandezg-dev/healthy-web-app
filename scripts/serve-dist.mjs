// Sirve el build de producción para los tests E2E, con la misma regla que el hosting: cualquier ruta
// sin fichero devuelve index.html (la app resuelve la ruta).
//
// - Sin más argumentos, las peticiones a la API las simula Playwright con page.route y aquí no llegan.
// - Con `--api <url>`, reenvía /api/* a esa API (pruebas contra el backend real): mismo origen, así que la cookie de
//   sesión funciona igual que en producción.
//
// Uso: node scripts/serve-dist.mjs [puerto] [--api http://127.0.0.1:8090]
import { readFile, stat } from 'node:fs/promises';
import { createServer, request as httpRequest } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';

const ROOT = resolve('dist/healthybites-app/browser');
const args = process.argv.slice(2);
const apiIndex = args.indexOf('--api');
const API = apiIndex >= 0 ? new URL(args[apiIndex + 1]) : null;
const rest =
  apiIndex >= 0 ? args.filter((_, index) => index < apiIndex || index > apiIndex + 1) : args;
const PORT = Number(rest[0] ?? 4300);
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

/** Reenvía la petición a la API tal cual (método, cabeceras, cuerpo) y devuelve su respuesta. */
function proxy(request, response) {
  const upstream = httpRequest(
    {
      protocol: API.protocol,
      hostname: API.hostname,
      port: API.port,
      method: request.method,
      path: request.url,
      headers: request.headers,
    },
    (answer) => {
      response.writeHead(answer.statusCode ?? 502, answer.headers);
      answer.pipe(response);
    },
  );
  upstream.on('error', () => {
    if (!response.headersSent) {
      response.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    response.end('La API no responde');
  });
  request.pipe(upstream);
}

createServer(async (request, response) => {
  const { pathname } = new URL(request.url ?? '/', 'http://localhost');
  if (API && pathname.startsWith('/api/')) {
    proxy(request, response);
    return;
  }
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
}).listen(PORT, () =>
  console.warn(`dist/ servido en http://localhost:${PORT}${API ? ` (API: ${API.origin})` : ''}`),
);
