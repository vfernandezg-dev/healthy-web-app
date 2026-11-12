# ADR 0009 · CSP y cabeceras de seguridad en `vercel.json`, comprobadas por los E2E

- **Estado:** aceptada
- **Fecha:** 2026-11-12

## Contexto

La app guarda el access token solo en memoria ([ADR 0003](0003-sesion-en-memoria.md)) y no usa `innerHTML` ni
`bypassSecurityTrust*`. Aun así, no había ninguna cabecera de seguridad:

- sin CSP;
- sin `frame-ancestors`, así que se podía incrustar en un iframe (clickjacking);
- sin HSTS ni `nosniff`.

El `index.html` del build llevaba un `<script>` en línea de Beasties (el CSS crítico en línea), incompatible con una
CSP sin `unsafe-inline`.

El hosting de la web aún no está decidido; Vercel es lo previsto.

## Decisión

- **`vercel.json`** declara:
  - el rewrite de la SPA: solo las rutas sin extensión van a `index.html`, y un fichero que falta da 404;
  - la caché: `immutable` para los ficheros con hash y `no-cache` para el resto;
  - las cabeceras de seguridad (ver más abajo).
- **CSP:**
  - `script-src 'self'`, sin hashes ni `unsafe-inline`. Para eso se desactiva `inlineCritical` en
    `angular.json`. En una SPA el CSS crítico casi no aporta: nada se pinta hasta que carga el bundle.
  - `style-src 'self' 'unsafe-inline'`: PrimeNG y Angular inyectan `<style>` en tiempo de ejecución, y un nonce
    necesitaría un servidor que lo genere en cada petición.
  - `connect-src 'self' https://api.healthybites.vfernandezg.dev`.
  - `img-src` y `media-src` admiten `https:` por las URLs prefirmadas del almacenamiento de ficheros.
  - `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'` y `form-action 'self'`.
- **Otras cabeceras:** HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (cámara, micrófono, geolocalización,
  pagos y USB desactivados), COOP `same-origin` y CORP `same-origin`.
- **Una sola fuente.** `scripts/serve-dist.mjs`, el servidor de las pruebas E2E y full-stack, aplica las cabeceras de
  `vercel.json`. Así las pruebas corren bajo la política de producción.
- **Los E2E fallan ante una violación de la CSP.** El `test` de `e2e/support/test.ts` lo comprueba de forma
  automática; se verificó rompiendo la política a propósito.

## Consecuencias

- **Un cambio que rompa la CSP falla en CI:** un script en línea, un dominio nuevo para la API o una librería que
  inyecte scripts.
- **Si la API cambia de dominio,** hay que actualizar `connect-src` en `vercel.json`.
- **Si el hosting no es Vercel,** se traducen las mismas reglas a su formato; la política no cambia.
- **Trusted Types se evaluó y queda fuera.** Con `require-trusted-types-for 'script'`, PrimeNG escribe `innerHTML`
  en un ShadowRoot fuera de las políticas de Angular y fallaban 119 de las 201 pruebas. Se revisará cuando PrimeNG lo
  soporte.

## Alternativas descartadas

- **`autoCsp` de Angular:** calcula los hashes de los scripts en línea y los pone en un `<meta>`, pero una CSP en
  `<meta>` no admite `frame-ancestors` ni informes. Sin scripts en línea no hace falta: la cabecera es más simple y
  más estricta.
- **Una CSP solo en `<meta>`:** por lo mismo, no protege frente al clickjacking.
