import { defineConfig, devices } from '@playwright/test';

/**
 * Pruebas contra la API real (antes de cada release). Necesitan la API en http://127.0.0.1:8090 con el perfil dev
 * (datos de demostración) y Mailpit con su API en MAILPIT_URL (por defecto http://localhost:8025). Ver
 * e2e-fullstack/README.md. Los recorridos comparten la base de datos: van en serie y con un solo worker.
 */
export default defineConfig({
  testDir: 'e2e-fullstack',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-fullstack' }]],
  use: {
    baseURL: 'http://localhost:4310',
    locale: 'es-ES',
    timezoneId: 'America/Lima',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `node scripts/serve-dist.mjs 4310 --api ${process.env['API_URL'] ?? 'http://127.0.0.1:8090'}`,
    url: 'http://localhost:4310',
    reuseExistingServer: true,
  },
});
