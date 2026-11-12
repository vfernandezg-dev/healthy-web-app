import { type Page, expect, test } from './support/test';
import { expectNoA11yViolations } from './support/a11y';
import { mockApi, requestBody } from './support/api';

/** Hoy y ayer según el navegador (la app usa la fecha local). */
async function browserDays(page: Page): Promise<{ today: string; yesterday: string }> {
  return page.evaluate(() => {
    const iso = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const now = new Date();
    const before = new Date(now);
    before.setDate(now.getDate() - 1);
    return { today: iso(now), yesterday: iso(before) };
  });
}

function log(id: string, loggedOn: string, scores: Partial<Record<string, number>> = {}) {
  const value = { hydration: 7, nutrition: 6, exercise: 5, sleep: 8, ...scores };
  const average = (value.hydration + value.nutrition + value.exercise + value.sleep) / 4;
  return { id, loggedOn, notes: null, average, ...value };
}

test.describe('hábitos', () => {
  test('registra el día moviendo los deslizadores con el teclado', async ({ page }) => {
    let created: Record<string, unknown> | undefined;
    let logs: unknown[] = [];
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/me/habit-logs?*': (route) => route.fulfill({ json: logs }),
        '/me/habit-logs': (route) => {
          created = requestBody<Record<string, unknown>>(route);
          logs = [{ id: 'h1', average: 5.75, ...created }];
          return route.fulfill({ status: 201, json: logs[0] });
        },
      },
    });

    await page.goto('/client/habits');
    const { today } = await browserDays(page);
    await expect(page.getByRole('heading', { level: 2, name: '¿Cómo te ha ido?' })).toBeVisible();
    await expect(
      page.getByRole('list', { name: 'Tus últimos días' }).getByRole('listitem'),
    ).toHaveCount(30);
    await expectNoA11yViolations(page);

    const hydration = page.getByRole('slider', { name: 'Hidratación' });
    await hydration.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(hydration).toHaveAttribute('aria-valuenow', '8');
    await page.getByRole('button', { name: 'Registrar el día' }).click();

    await expect(page.getByText('¡Día registrado!')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Hoy, registrado' })).toBeVisible();
    expect(created).toEqual({
      loggedOn: today,
      hydration: 8,
      nutrition: 5,
      exercise: 5,
      sleep: 5,
      notes: null,
    });
  });

  test('edita el registro de hoy y registra el de ayer', async ({ page }) => {
    const requests: { method: string; body: unknown }[] = [];
    let days = { today: '', yesterday: '' };
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/me/habit-logs?*': (route) => route.fulfill({ json: [log('hoy', days.today)] }),
        '/me/habit-logs/hoy': (route) => {
          requests.push({ method: 'PUT', body: route.request().postDataJSON() });
          return route.fulfill({ json: log('hoy', days.today, { sleep: 9 }) });
        },
        '/me/habit-logs': (route) => {
          requests.push({ method: 'POST', body: route.request().postDataJSON() });
          return route.fulfill({ status: 201, json: log('ayer', days.yesterday) });
        },
      },
    });
    await page.goto('/');
    days = await browserDays(page);

    await page.goto('/client/habits');
    await expect(page.getByRole('heading', { level: 2, name: 'Hoy, registrado' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Hoy, registrado' })).toContainText(
      'Media de 6,5',
    );

    await page.getByRole('button', { name: 'Editar hoy' }).click();
    const sleep = page.getByRole('slider', { name: 'Sueño' });
    await sleep.focus();
    await page.keyboard.press('ArrowRight');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Registro actualizado')).toBeVisible();

    await page.getByRole('button', { name: 'Registrar ayer' }).click();
    await page.getByRole('button', { name: 'Registrar el día' }).click();
    await expect(page.getByText('¡Día registrado!')).toBeVisible();

    expect(requests).toEqual([
      {
        method: 'PUT',
        body: {
          loggedOn: days.today,
          hydration: 7,
          nutrition: 6,
          exercise: 5,
          sleep: 9,
          notes: null,
        },
      },
      {
        method: 'POST',
        body: {
          loggedOn: days.yesterday,
          hydration: 5,
          nutrition: 5,
          exercise: 5,
          sleep: 5,
          notes: null,
        },
      },
    ]);
  });
});
