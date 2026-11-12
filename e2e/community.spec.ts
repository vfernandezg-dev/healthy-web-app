import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './support/a11y';
import { mockApi, problem, sessionFor } from './support/api';

/** PNG de 1×1 px para las imágenes simuladas. */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);
/** Las imágenes de las publicaciones se identifican por su UUID en la ruta (/media/{id}). */
const IMAGE = '0193a1b2-c3d4-7e5f-8a6b-7c8d9e0f1a2b';

const MARIA = { id: sessionFor('CLIENT').user.id, name: 'María López' };
const CARLOS = { id: sessionFor('NUTRITIONIST').user.id, name: 'Carlos García' };
const LUCIA = { id: '00000000-0000-7000-8000-000000000007', name: 'Lucía Torres' };

type Person = typeof MARIA;
type Membership = { role: 'OWNER' | 'MEMBER'; status: 'ACTIVE' | 'PENDING' } | null;

const ACTIVE_MEMBER: Membership = { role: 'MEMBER', status: 'ACTIVE' };
const OWNER: Membership = { role: 'OWNER', status: 'ACTIVE' };
const PENDING: Membership = { role: 'MEMBER', status: 'PENDING' };

function group(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    name: `Grupo ${id}`,
    description: 'Recetas, dudas y avances.',
    visibility: 'PUBLIC',
    members: 3,
    membership: null as Membership,
    createdAt: '2026-10-01T15:00:00Z',
    ...overrides,
  };
}

function post(id: string, author: Person, overrides: Record<string, unknown> = {}) {
  return {
    id,
    groupId: 'g1',
    title: `Publicación ${id}`,
    body: 'Hoy he probado una receta nueva.',
    imagePath: null as string | null,
    author,
    createdAt: '2026-11-10T14:30:00Z',
    updatedAt: '2026-11-10T14:30:00Z',
    ...overrides,
  };
}

function member(person: Person, role = 'MEMBER', status = 'ACTIVE') {
  return { person, role, status, since: '2026-10-02T10:00:00Z' };
}

function paged<T>(content: T[], size = 10) {
  return {
    content,
    page: { size, number: 0, totalElements: content.length, totalPages: content.length ? 1 : 0 },
  };
}

/** La página `number` (de 20 en 20, como los comentarios y los miembros) de una lista completa. */
function slice<T>(all: T[], number: number, size = 20) {
  return {
    content: all.slice(number * size, number * size + size),
    page: { size, number, totalElements: all.length, totalPages: Math.ceil(all.length / size) },
  };
}

function pageParam(url: string): number {
  return Number(new URL(url).searchParams.get('page'));
}

test.describe('comunidad: directorio', () => {
  test('busca grupos y crea uno privado', async ({ page }) => {
    const searches: (string | null)[] = [];
    let created: { name: string; description: string | null; visibility: string } | undefined;
    const newGroup = () =>
      group('nuevo', {
        ...created,
        members: 1,
        membership: OWNER,
        createdAt: '2026-11-12T10:00:00Z',
      });
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/groups?*': (route) => {
          const query = new URL(route.request().url()).searchParams.get('q');
          searches.push(query);
          const all = [
            group('g1', { name: 'Recetas saludables', membership: ACTIVE_MEMBER }),
            group('g2', {
              name: 'Club de corredores',
              visibility: 'PRIVATE',
              members: 1,
              membership: PENDING,
            }),
          ];
          const found = query ? all.filter((g) => g.name.toLowerCase().includes(query)) : all;
          return route.fulfill({ json: paged(found, 12) });
        },
        '/groups': (route) => {
          created = route.request().postDataJSON();
          return route.fulfill({ status: 201, json: newGroup() });
        },
        '/groups/nuevo': (route) => route.fulfill({ json: newGroup() }),
        '/groups/nuevo/posts?*': (route) => route.fulfill({ json: paged([]) }),
        '/groups/nuevo/members?*': (route) =>
          route.fulfill({ json: paged([member(MARIA, 'OWNER')], 20) }),
      },
    });

    await page.goto('/client/community');
    const recipes = page.getByRole('link', { name: /Recetas saludables/ });
    await expect(recipes).toContainText('Eres miembro');
    await expect(recipes).toContainText('3 miembros');
    await expect(recipes).toHaveAttribute('href', '/client/community/groups/g1');
    const runners = page.getByRole('link', { name: /Club de corredores/ });
    await expect(runners).toContainText('Privado');
    await expect(runners).toContainText('Solicitud pendiente');
    await expect(runners).toContainText('1 miembro');
    await expectNoA11yViolations(page);

    await page.getByRole('searchbox', { name: 'Buscar grupos por nombre' }).fill('recetas');
    await expect(runners).toBeHidden();
    await expect(recipes).toBeVisible();
    expect(searches).toEqual([null, 'recetas']);

    await page.getByRole('button', { name: 'Nuevo grupo' }).click();
    const dialog = page.getByRole('dialog', { name: 'Nuevo grupo' });
    await dialog.getByRole('button', { name: 'Crear el grupo' }).click();
    await expect(dialog.getByText('Ponle un nombre')).toBeVisible();
    await expect(dialog.getByLabel('Nombre')).toBeFocused();

    await dialog.getByLabel('Nombre').fill('Comer en familia');
    await dialog.getByLabel('Descripción').fill('Ideas para que en casa coman todos lo mismo.');
    await dialog.getByText('Privado', { exact: true }).click();
    await expect(dialog.getByText('Hay que pedir entrar')).toBeVisible();
    await expectNoA11yViolations(page);
    await dialog.getByRole('button', { name: 'Crear el grupo' }).click();

    await expect(page).toHaveURL(/\/client\/community\/groups\/nuevo$/);
    await expect(page.getByText('Grupo creado')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Comer en familia');
    await expect(page.getByText('Lo creaste tú')).toBeVisible();
    await expect(page.getByText('Aún no hay publicaciones')).toBeVisible();
    expect(created).toEqual({
      name: 'Comer en familia',
      description: 'Ideas para que en casa coman todos lo mismo.',
      visibility: 'PRIVATE',
    });
  });
});

test.describe('comunidad: un grupo', () => {
  test('un miembro comenta, denuncia, edita lo suyo y publica', async ({ page }) => {
    const calls: string[] = [];
    let posts = [
      post('p1', MARIA, {
        title: 'Mi primera semana',
        imagePath: `/media/${IMAGE}`,
        updatedAt: '2026-11-11T08:00:00Z',
      }),
      post('p2', CARLOS, { title: 'Receta de hummus' }),
    ];
    const comments = [
      {
        id: 'c1',
        body: '¿Alguien lo ha probado con remolacha?',
        author: CARLOS,
        createdAt: '2026-11-10T16:00:00Z',
      },
    ];
    let reports = 0;
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/groups/g1': (route) =>
          route.fulfill({
            json: group('g1', { name: 'Recetas saludables', membership: ACTIVE_MEMBER }),
          }),
        '/groups/g1/members?*': (route) =>
          route.fulfill({ json: paged([member(CARLOS, 'OWNER'), member(MARIA)], 20) }),
        '/groups/g1/posts?*': (route) => route.fulfill({ json: paged(posts) }),
        '/groups/g1/posts': (route) => {
          const body = route.request().postDataJSON();
          calls.push(`POST ${JSON.stringify(body)}`);
          const created = post('p3', MARIA, { title: body.title, body: body.body });
          posts = [created, ...posts];
          return route.fulfill({ status: 201, json: created });
        },
        '/posts/p1': (route) => {
          const body = route.request().postDataJSON();
          calls.push(`PUT p1 ${JSON.stringify(body)}`);
          posts = posts.map((p) => (p.id === 'p1' ? { ...p, title: body.title } : p));
          return route.fulfill({ json: posts.find((p) => p.id === 'p1') });
        },
        '/posts/p2/comments?*': (route) => route.fulfill({ json: paged(comments, 20) }),
        '/posts/p2/comments': (route) => {
          const created = {
            id: 'c2',
            body: route.request().postDataJSON().body,
            author: MARIA,
            createdAt: '2026-11-12T10:00:00Z',
          };
          comments.push(created);
          return route.fulfill({ status: 201, json: created });
        },
        '/posts/p2/reports': (route) => {
          reports += 1;
          calls.push(`REPORT ${JSON.stringify(route.request().postDataJSON())}`);
          return reports === 1
            ? route.fulfill({ status: 204 })
            : route.fulfill(problem(409, 'already-reported', 'Ya denunciaste esta publicación'));
        },
        '/media?*': (route) =>
          route.fulfill({
            json: {
              id: 'subida',
              contentType: 'image/png',
              sizeBytes: 2048,
              path: '/media/subida',
            },
          }),
        [`/media/${IMAGE}`]: (route) => route.fulfill({ contentType: 'image/png', body: PNG }),
        '/media/subida': (route) => route.fulfill({ contentType: 'image/png', body: PNG }),
      },
    });

    await page.goto('/client/community/groups/g1');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Recetas saludables');
    await expect(
      page.getByRole('main').getByRole('link', { name: 'Comunidad', exact: true }),
    ).toHaveAttribute('href', '/client/community');
    await expect(page.getByRole('button', { name: 'Salir del grupo' })).toBeVisible();

    const mine = page.getByRole('article', { name: 'Mi primera semana' });
    await expect(mine).toContainText('editada');
    await expect(mine.getByRole('button', { name: 'Editar' })).toBeVisible();
    await expect(mine.getByRole('button', { name: 'Eliminar' })).toBeVisible();
    await expect(mine.getByRole('button', { name: 'Denunciar' })).toHaveCount(0);
    const other = page.getByRole('article', { name: 'Receta de hummus' });
    await expect(other).toContainText('Carlos García');
    await expect(other).toContainText('10 de noviembre, 09:30');
    await expect(other.getByRole('button', { name: 'Editar' })).toHaveCount(0);
    await expect(other.getByRole('button', { name: 'Eliminar' })).toHaveCount(0);

    const members = page.getByRole('region', { name: 'Miembros' });
    await expect(members.getByRole('listitem').filter({ hasText: 'Carlos García' })).toContainText(
      'Creador del grupo',
    );
    await expect(members).toContainText('María López');
    await expect(members.getByRole('button')).toHaveCount(0);
    await expectNoA11yViolations(page);

    // Comentarios: se cargan al desplegarlos.
    await other.getByRole('button', { name: 'Comentarios' }).click();
    await expect(other.getByText('¿Alguien lo ha probado con remolacha?')).toBeVisible();
    await expect(
      other.getByRole('button', { name: 'Denunciar el comentario de Carlos García' }),
    ).toBeVisible();
    await other.getByLabel('Tu comentario').fill('Con remolacha queda genial.');
    await other.getByRole('button', { name: 'Comentar', exact: true }).click();
    await expect(other.getByText('Con remolacha queda genial.')).toBeVisible();
    await expect(other.getByLabel('Tu comentario')).toHaveValue('');
    await expect(
      other.getByRole('button', { name: 'Eliminar el comentario de María López' }),
    ).toBeVisible();
    await expectNoA11yViolations(page);

    // Denunciar: la segunda vez la API avisa de que ya está denunciada.
    for (const attempt of [1, 2]) {
      await other.getByRole('button', { name: 'Denunciar', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Denunciar' });
      await dialog.getByLabel('Motivo').fill('Publicidad encubierta');
      await dialog.getByRole('button', { name: 'Enviar la denuncia' }).click();
      if (attempt === 1) {
        await expect(page.getByText('Denuncia enviada')).toBeVisible();
        await expect(dialog).toBeHidden();
      } else {
        await expect(dialog.getByText('Ya denunciaste esta publicación')).toBeVisible();
        await dialog.getByRole('button', { name: 'Cancelar' }).click();
        await expect(dialog).toBeHidden();
      }
    }

    // Editar lo suyo conserva la imagen.
    await mine.getByRole('button', { name: 'Editar' }).click();
    const editor = page.getByRole('dialog', { name: 'Editar la publicación' });
    await expect(editor.getByLabel('Título')).toHaveValue('Mi primera semana');
    await expect(editor.getByText('Fichero guardado')).toBeVisible();
    await editor.getByLabel('Título').fill('Mi primera semana completa');
    await editor.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Publicación actualizada')).toBeVisible();
    await expect(page.getByRole('article', { name: 'Mi primera semana completa' })).toBeVisible();

    // Una imagen subida y cancelada no pasa a la siguiente publicación.
    const publish = page
      .getByRole('region', { name: 'Publicaciones' })
      .getByRole('button', { name: 'Publicar' });
    await publish.click();
    const composer = page.getByRole('dialog', { name: 'Nueva publicación' });
    await composer.locator('#post-image').setInputFiles({
      name: 'plato.png',
      mimeType: 'image/png',
      buffer: PNG,
    });
    await expect(composer.getByText('Fichero subido (2 KB)')).toBeVisible();
    await composer.getByRole('button', { name: 'Cancelar' }).click();
    await expect(composer).toBeHidden();
    await publish.click();
    await expect(composer.getByText('Ningún fichero')).toBeVisible();
    await composer.getByLabel('Título').fill('Batido verde');
    await composer.getByLabel('Texto').fill('Espinacas, plátano y avena.');
    await expectNoA11yViolations(page);
    await composer.getByRole('button', { name: 'Publicar' }).click();
    await expect(page.getByText('Publicación creada')).toBeVisible();
    await expect(page.getByRole('article', { name: 'Batido verde' })).toBeVisible();

    expect(calls).toEqual([
      'REPORT {"reason":"Publicidad encubierta"}',
      'REPORT {"reason":"Publicidad encubierta"}',
      `PUT p1 {"title":"Mi primera semana completa","body":"Hoy he probado una receta nueva.","imageMediaId":"${IMAGE}"}`,
      'POST {"title":"Batido verde","body":"Espinacas, plátano y avena.","imageMediaId":null}',
    ]);
  });

  test('carga los comentarios y los miembros de 20 en 20 con «Ver más»', async ({ page }) => {
    const people = Array.from({ length: 21 }, (_, index) => ({
      id: `00000000-0000-7000-8000-1000000000${String(index + 10)}`,
      name: `Persona ${index + 1}`,
    }));
    const members = [member(CARLOS, 'OWNER'), ...people.map((person) => member(person))];
    const comments = Array.from({ length: 23 }, (_, index) => ({
      id: `c${index + 1}`,
      body: `Comentario número ${index + 1}`,
      author: CARLOS,
      createdAt: '2026-11-10T16:00:00Z',
    }));
    const requested: string[] = [];
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/groups/g4': (route) =>
          route.fulfill({ json: group('g4', { members: 22, membership: ACTIVE_MEMBER }) }),
        '/groups/g4/posts?*': (route) =>
          route.fulfill({ json: paged([post('p9', CARLOS, { groupId: 'g4', title: 'Dudas' })]) }),
        '/groups/g4/members?*': (route) => {
          const number = pageParam(route.request().url());
          requested.push(`members ${number}`);
          return route.fulfill({ json: slice(members, number) });
        },
        '/posts/p9/comments?*': (route) => {
          const number = pageParam(route.request().url());
          requested.push(`comments ${number}`);
          return route.fulfill({ json: slice(comments, number) });
        },
        '/posts/p9/comments': (route) => {
          const created = {
            id: 'c-nuevo',
            body: route.request().postDataJSON().body,
            author: MARIA,
            createdAt: '2026-11-12T10:00:00Z',
          };
          comments.push(created);
          return route.fulfill({ status: 201, json: created });
        },
      },
    });

    await page.goto('/client/community/groups/g4');
    const panel = page.getByRole('region', { name: 'Miembros' });
    await expect(panel.getByRole('listitem')).toHaveCount(20);
    await panel.getByRole('button', { name: 'Ver más miembros' }).click();
    await expect(panel.getByRole('listitem')).toHaveCount(22);
    await expect(panel.getByRole('listitem').last()).toContainText('Persona 21');
    await expect(panel.getByRole('button', { name: 'Ver más miembros' })).toHaveCount(0);

    const article = page.getByRole('article', { name: 'Dudas' });
    const items = article.getByRole('listitem');
    await article.getByRole('button', { name: 'Comentarios' }).click();
    await expect(items).toHaveCount(20);
    await expect(items.first()).toContainText('Comentario número 1');
    await expectNoA11yViolations(page);

    // Los siguientes (más nuevos) van detrás.
    await article.getByRole('button', { name: 'Ver más comentarios' }).click();
    await expect(items).toHaveCount(23);
    await expect(items.last()).toContainText('Comentario número 23');
    await expect(article.getByRole('button', { name: 'Ver más comentarios' })).toHaveCount(0);

    // El comentario nuevo sale al final sin volver a pedir la lista.
    await article.getByLabel('Tu comentario').fill('Gracias a todos');
    await article.getByRole('button', { name: 'Comentar', exact: true }).click();
    await expect(items).toHaveCount(24);
    await expect(items.last()).toContainText('Gracias a todos');

    // Al volver a abrirlos, empiezan otra vez por la primera página.
    await article.getByRole('button', { name: 'Ocultar los comentarios' }).click();
    await article.getByRole('button', { name: 'Comentarios' }).click();
    await expect(items).toHaveCount(20);
    await expect(article.getByRole('button', { name: 'Ver más comentarios' })).toBeVisible();

    expect(requested).toEqual(['members 0', 'members 1', 'comments 0', 'comments 1', 'comments 0']);
  });

  test('pide entrar en un grupo privado y retira la solicitud', async ({ page }) => {
    const calls: string[] = [];
    let membership: Membership = null;
    const privateGroup = () =>
      group('g2', { name: 'Club de corredores', visibility: 'PRIVATE', members: 4, membership });
    page.on('request', (request) => {
      if (request.url().includes('/posts')) {
        calls.push(`GET posts`);
      }
    });
    await mockApi(page, {
      session: 'CLIENT',
      routes: {
        '/groups/g2': (route) => route.fulfill({ json: privateGroup() }),
        '/groups/g2/members': (route) => {
          calls.push(`${route.request().method()} members`);
          membership = PENDING;
          return route.fulfill({ json: privateGroup() });
        },
        '/groups/g2/members/me': (route) => {
          calls.push(`${route.request().method()} members/me`);
          membership = null;
          return route.fulfill({ status: 204 });
        },
      },
    });

    await page.goto('/client/community/groups/g2');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Club de corredores');
    await expect(page.getByText('Pide entrar para leer sus publicaciones')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Miembros' })).toHaveCount(0);
    await expectNoA11yViolations(page);

    await page.getByRole('button', { name: 'Pedir entrar' }).click();
    await expect(page.getByText('Solicitud enviada')).toBeVisible();
    await expect(page.getByText('Tu solicitud está pendiente')).toBeVisible();
    await page.getByRole('button', { name: 'Retirar la solicitud' }).click();
    await expect(page.getByText('Solicitud retirada')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pedir entrar' })).toBeVisible();

    expect(calls).toEqual(['POST members', 'DELETE members/me']);
  });

  test('el creador modera: solicitudes, miembros, publicaciones y el grupo', async ({ page }) => {
    const calls: string[] = [];
    let members = [member(CARLOS, 'OWNER'), member(MARIA), member(LUCIA, 'MEMBER', 'PENDING')];
    let posts = [post('p1', MARIA, { groupId: 'g3', title: 'Oferta milagrosa' })];
    let current = group('g3', {
      name: 'Consulta abierta',
      visibility: 'PRIVATE',
      members: 2,
      membership: OWNER,
    });
    await mockApi(page, {
      session: 'NUTRITIONIST',
      routes: {
        '/groups?*': (route) => route.fulfill({ json: paged([], 12) }),
        '/groups/g3': (route) => {
          const method = route.request().method();
          if (method === 'PUT') {
            const body = route.request().postDataJSON();
            calls.push(`PUT ${JSON.stringify(body)}`);
            current = { ...current, ...body };
          } else if (method === 'DELETE') {
            calls.push('DELETE group');
            return route.fulfill({ status: 204 });
          }
          return route.fulfill({ json: current });
        },
        '/groups/g3/posts?*': (route) => route.fulfill({ json: paged(posts) }),
        '/groups/g3/members?*': (route) => route.fulfill({ json: paged(members, 20) }),
        [`/groups/g3/members/${LUCIA.id}/approve`]: (route) => {
          calls.push('approve Lucía');
          members = members.map((m) => (m.person === LUCIA ? { ...m, status: 'ACTIVE' } : m));
          current = { ...current, members: 3 };
          return route.fulfill({ status: 204 });
        },
        [`/groups/g3/members/${MARIA.id}`]: (route) => {
          calls.push('kick María');
          members = members.filter((m) => m.person !== MARIA);
          current = { ...current, members: 2 };
          return route.fulfill({ status: 204 });
        },
        '/posts/p1': (route) => {
          calls.push('DELETE p1');
          posts = [];
          return route.fulfill({ status: 204 });
        },
      },
    });

    await page.goto('/nutritionist/community/groups/g3');
    const panel = page.getByRole('region', { name: 'Miembros' });
    await expect(panel).toContainText('Solicitudes pendientes (1)');
    await expect(panel.getByRole('button', { name: 'Expulsar a Carlos García' })).toHaveCount(0);
    await expectNoA11yViolations(page);

    await panel.getByRole('button', { name: 'Aprobar a Lucía Torres' }).click();
    await expect(page.getByText('Lucía Torres ya es miembro')).toBeVisible();
    await expect(panel).not.toContainText('Solicitudes pendientes');
    await expect(page.getByText('3 miembros')).toBeVisible();

    await panel.getByRole('button', { name: 'Expulsar a María López' }).click();
    await page
      .getByRole('alertdialog', { name: 'Expulsar del grupo' })
      .getByRole('button', { name: 'Expulsar' })
      .click();
    await expect(page.getByText('Miembro expulsado')).toBeVisible();
    await expect(panel).not.toContainText('María López');

    const spam = page.getByRole('article', { name: 'Oferta milagrosa' });
    await expect(spam.getByRole('button', { name: 'Editar' })).toHaveCount(0);
    await spam.getByRole('button', { name: 'Eliminar' }).click();
    const confirm = page.getByRole('alertdialog', { name: 'Eliminar la publicación' });
    await expect(confirm).toContainText('Como creador del grupo');
    await confirm.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByText('Publicación eliminada')).toBeVisible();
    await expect(page.getByText('Aún no hay publicaciones')).toBeVisible();

    await page.getByRole('button', { name: 'Editar', exact: true }).click();
    const editor = page.getByRole('dialog', { name: 'Editar el grupo' });
    await expect(editor.getByLabel('Nombre')).toHaveValue('Consulta abierta');
    await editor.getByLabel('Nombre').fill('Consulta abierta de nutrición');
    await editor.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Grupo actualizado')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Consulta abierta de nutrición',
    );

    await page.getByRole('button', { name: 'Eliminar el grupo' }).click();
    await page
      .getByRole('alertdialog', { name: 'Eliminar el grupo' })
      .getByRole('button', { name: 'Eliminar' })
      .click();
    await expect(page).toHaveURL(/\/nutritionist\/community$/);
    await expect(page.getByText('Grupo eliminado')).toBeVisible();
    await expect(page.getByText('Aún no hay grupos')).toBeVisible();

    expect(calls).toEqual([
      'approve Lucía',
      'kick María',
      'DELETE p1',
      'PUT {"name":"Consulta abierta de nutrición","description":"Recetas, dudas y avances.","visibility":"PRIVATE"}',
      'DELETE group',
    ]);
  });
});
