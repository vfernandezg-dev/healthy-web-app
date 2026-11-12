import { defineConfig, devices } from '@playwright/test';

/**
 * Pruebas E2E sobre el build de producción (`pnpm build` antes de ejecutarlas). La API se simula en cada
 * test con page.route (ver e2e/support), así que no hace falta el backend.
 */
const PORT = 4300;
const BASE_URL = `http://localhost:${PORT}`;
const CI = Boolean(process.env['CI']);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    locale: 'es-ES',
    timezoneId: 'America/Lima',
    // Sin animaciones: axe no analiza capas a medio cerrar y se prueba el modo de movimiento reducido.
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `node scripts/serve-dist.mjs ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !CI,
  },
});
