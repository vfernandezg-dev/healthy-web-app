import { test as base, expect } from '@playwright/test';

export * from '@playwright/test';

/**
 * El `test` de Playwright con una comprobación automática: si el navegador bloquea algo por la política de seguridad
 * (CSP de vercel.json, que sirve scripts/serve-dist.mjs), la prueba falla. Así un cambio que rompa la CSP en
 * producción se ve aquí antes. Las pruebas importan `test` y `expect` desde este módulo.
 */
export const test = base.extend<{ cspViolations: string[] }>({
  cspViolations: [
    async ({ page }, use) => {
      const violations: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error' && message.text().includes('Content Security Policy')) {
          violations.push(message.text());
        }
      });
      await use(violations);
      expect(violations, 'violaciones de la CSP').toEqual([]);
    },
    { auto: true },
  ],
});
