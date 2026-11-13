import { expect, test } from './support/test';
import { expectNoA11yViolations } from './support/a11y';
import { mockApi, problem, requestBody } from './support/api';

/** PNG de 1×1 px para portadas simuladas. */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

function item(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    slug: `contenido-${id}`,
    title: `Contenido ${id}`,
    summary: 'Ideas prácticas para comer mejor.',
    type: 'ARTICLE',
    category: 'NUTRITION',
    requiredTier: 'BASIC',
    locked: false,
    coverPath: null,
    hasFile: false,
    status: 'PUBLISHED',
    author: { id: 'n1', name: 'Elena Gómez' },
    publishedAt: '2026-11-01T10:00:00Z',
    ...overrides,
  };
}

function page<T>(content: T[]) {
  return { content, page: { size: 12, number: 0, totalElements: content.length, totalPages: 1 } };
}

test.describe('contenido para clientes', () => {
  test('busca y filtra el catálogo y ve lo desbloqueado con rachas', async ({ page: browser }) => {
    const queries: string[] = [];
    await mockApi(browser, {
      session: 'CLIENT',
      routes: {
        '/me/content-unlocks': (route) =>
          route.fulfill({ json: [item('premio', { title: 'Guía de premio', type: 'GUIDE' })] }),
        '/content-items?*': (route) => {
          const params = new URL(route.request().url()).searchParams;
          queries.push(`${params.get('type') ?? '-'}|${params.get('q') ?? '-'}`);
          return route.fulfill({
            json: page([
              item('a', { title: 'Comer fuera de casa', coverPath: '/media/portada' }),
              item('b', {
                title: 'Yoga en casa',
                type: 'VIDEO',
                requiredTier: 'PREMIUM',
                locked: true,
              }),
            ]),
          });
        },
        '/media/portada': (route) => route.fulfill({ contentType: 'image/png', body: PNG }),
      },
    });

    await browser.goto('/client/content');
    await expect(
      browser
        .getByRole('region', { name: 'Desbloqueado con tus rachas' })
        .getByText('Guía de premio'),
    ).toBeVisible();
    await expect(browser.getByRole('link', { name: /Yoga en casa/ })).toContainText('Bloqueado');
    await expectNoA11yViolations(browser);

    await browser.getByLabel('Buscar contenido por título').fill('yoga');
    await expect.poll(() => queries.at(-1)).toBe('-|yoga');
    await browser.getByText('Vídeo', { exact: true }).click();
    await expect.poll(() => queries.at(-1)).toBe('VIDEO|yoga');
  });

  test('lee un contenido y abre su guía con un enlace firmado', async ({ page: browser }) => {
    await mockApi(browser, {
      session: 'CLIENT',
      routes: {
        '/content-items/contenido-guia': (route) =>
          route.fulfill({
            json: {
              item: item('guia', { type: 'GUIDE', hasFile: true, coverPath: '/media/portada' }),
              body: 'Primer párrafo.\n\nSegundo párrafo.',
            },
          }),
        '/content-items/guia/file': (route) =>
          route.fulfill({
            json: { path: '/media/fichero?expires=99&signature=firma', expiresInSeconds: 300 },
          }),
        '/media/portada': (route) => route.fulfill({ contentType: 'image/png', body: PNG }),
        '/media/fichero?*': (route) => route.fulfill({ contentType: 'text/plain', body: 'PDF' }),
      },
    });

    await browser.goto('/client/content/contenido-guia');
    await expect(browser.getByRole('heading', { level: 1, name: 'Contenido guia' })).toBeVisible();
    await expect(browser.getByText('Segundo párrafo.')).toBeVisible();
    await expectNoA11yViolations(browser);

    const popup = browser.waitForEvent('popup');
    await browser.getByRole('button', { name: 'Abrir la guía' }).click();
    const tab = await popup;
    await expect(tab).toHaveURL(/\/api\/v1\/media\/fichero\?expires=99&signature=firma$/);
  });

  test('un vídeo se ve en la propia página', async ({ page: browser }) => {
    await mockApi(browser, {
      session: 'CLIENT',
      routes: {
        '/content-items/contenido-video': (route) =>
          route.fulfill({
            json: { item: item('video', { type: 'VIDEO', hasFile: true }), body: null },
          }),
        '/content-items/video/file': (route) =>
          route.fulfill({
            json: { path: '/media/clip?expires=1&signature=s', expiresInSeconds: 300 },
          }),
        '/media/clip?*': (route) => route.fulfill({ status: 204 }),
      },
    });

    await browser.goto('/client/content/contenido-video');
    await browser.getByRole('button', { name: 'Ver el vídeo' }).click();

    // URL absoluta y comprobada: solo rutas de la propia API.
    await expect(browser.locator('video')).toHaveAttribute(
      'src',
      /^http:\/\/localhost:\d+\/api\/v1\/media\/clip\?expires=1&signature=s$/,
    );
  });

  test('un contenido bloqueado explica qué nivel pide', async ({ page: browser }) => {
    await mockApi(browser, {
      session: 'CLIENT',
      routes: {
        '/content-items/solo-premium': (route) =>
          route.fulfill(
            problem(403, 'subscription-required', 'Necesitas Premium', { requiredTier: 'PREMIUM' }),
          ),
      },
    });

    await browser.goto('/client/content/solo-premium');
    await expect(
      browser.getByRole('heading', { level: 1, name: 'Este contenido es Premium' }),
    ).toBeVisible();
  });
});

test.describe('contenido del nutricionista', () => {
  test('crea una guía con portada, la guarda como borrador y la publica', async ({
    page: browser,
  }) => {
    let created: Record<string, unknown> | undefined;
    let status = 'DRAFT';
    const saved = () => ({
      item: item('nueva', {
        title: 'Guía de la compra',
        type: 'GUIDE',
        status,
        coverPath: '/media/cover1',
        publishedAt: status === 'PUBLISHED' ? '2026-11-12T10:00:00Z' : null,
      }),
      body: null,
      coverMediaId: 'cover1',
      fileMediaId: null,
    });
    await mockApi(browser, {
      session: 'NUTRITIONIST',
      routes: {
        '/media?*': (route) =>
          route.fulfill({
            json: {
              id: 'cover1',
              contentType: 'image/png',
              sizeBytes: 2048,
              path: '/media/cover1',
            },
          }),
        '/media/cover1': (route) => route.fulfill({ contentType: 'image/png', body: PNG }),
        '/nutritionist/content-items': (route) => {
          created = requestBody<Record<string, unknown>>(route);
          return route.fulfill({ status: 201, json: saved() });
        },
        '/nutritionist/content-items/nueva': (route) => route.fulfill({ json: saved() }),
        '/nutritionist/content-items/nueva/publish': (route) => {
          status = 'PUBLISHED';
          return route.fulfill({ json: saved() });
        },
      },
    });

    await browser.goto('/nutritionist/content/new');
    await browser.getByText('Guía', { exact: true }).click();
    await browser.getByLabel('Título').fill('Guía de la compra');
    await browser.getByLabel('Resumen').fill('Cómo llenar la cesta con cabeza.');
    await browser.getByRole('combobox', { name: 'Categoría' }).click();
    await browser.getByRole('option', { name: 'Nutrición' }).click();
    await expect(browser.getByRole('listbox')).toBeHidden();
    await browser.locator('#content-cover').setInputFiles({
      name: 'portada.png',
      mimeType: 'image/png',
      buffer: PNG,
    });
    await expect(browser.getByText('Fichero subido (2 KB)')).toBeVisible();
    await expectNoA11yViolations(browser);
    await browser.getByRole('button', { name: 'Guardar el borrador' }).click();

    await expect(browser).toHaveURL(/\/nutritionist\/content\/nueva$/);
    expect(created).toEqual({
      title: 'Guía de la compra',
      summary: 'Cómo llenar la cesta con cabeza.',
      body: null,
      type: 'GUIDE',
      category: 'NUTRITION',
      requiredTier: 'BASIC',
      coverMediaId: 'cover1',
      fileMediaId: null,
    });

    await browser.getByRole('button', { name: 'Publicar' }).click();
    await expect(
      browser.getByText('Publicado en el catálogo como «contenido-nueva».'),
    ).toBeVisible();
  });

  test('con almacenamiento de objetos, la portada se sube directamente a R2 y se confirma', async ({
    page: browser,
  }) => {
    const r2 = 'https://cuenta.r2.cloudflarestorage.com/healthy-bites-media/pending-x.png';
    let started: Record<string, unknown> | undefined;
    let confirmed: Record<string, unknown> | undefined;
    let put:
      { contentType: string | null; authorization: string | null; bytes: number } | undefined;
    await mockApi(browser, {
      session: 'NUTRITIONIST',
      routes: {
        '/media/uploads': (route) => {
          started = requestBody<Record<string, unknown>>(route);
          return route.fulfill({
            status: 201,
            json: {
              uploadUrl: `${r2}?X-Amz-Signature=firma`,
              contentType: 'image/png',
              ticket: 'billete-firmado',
              expiresAt: '2026-11-13T20:00:00Z',
            },
          });
        },
        '/media/uploads/complete': (route) => {
          confirmed = requestBody<Record<string, unknown>>(route);
          return route.fulfill({
            status: 201,
            json: {
              id: 'cover1',
              contentType: 'image/png',
              sizeBytes: 2048,
              path: '/media/cover1',
            },
          });
        },
        '/media/cover1': (route) => route.fulfill({ contentType: 'image/png', body: PNG }),
      },
    });
    await browser.route(`${r2}?*`, async (route) => {
      const request = route.request();
      put = {
        contentType: await request.headerValue('content-type'),
        authorization: await request.headerValue('authorization'),
        bytes: request.postDataBuffer()?.length ?? 0,
      };
      await route.fulfill({
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    });

    await browser.goto('/nutritionist/content/new');
    await browser.locator('#content-cover').setInputFiles({
      name: 'portada.png',
      mimeType: 'image/png',
      buffer: PNG,
    });

    await expect(browser.getByText('Fichero subido (2 KB)')).toBeVisible();
    expect(started).toEqual({
      purpose: 'CONTENT_COVER',
      contentType: 'image/png',
      sizeBytes: PNG.length,
    });
    expect(put).toEqual({ contentType: 'image/png', authorization: null, bytes: PNG.length });
    expect(confirmed).toEqual({ ticket: 'billete-firmado' });
  });
});
