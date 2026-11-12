import { type Signal, computed, inject } from '@angular/core';
import type { GroupResponse, PostResponse } from '@core/api/schema';
import { AuthStore } from '@core/auth/auth-store';
import { Toaster } from '@core/ui/toaster';
import { PAGE_SIZE } from '@shared/table/page-size';
import { pagedQuery } from '@shared/table/paged-query';
import { mutation } from '@shared/utils/mutation';
import { CommunityApi, type PostFilters } from './community-api';
import { type Viewer, membershipLabel, relationOf, viewerOf } from './membership';

/**
 * Estado de la página de un grupo: el grupo, quién lo mira y qué relación tiene con él, sus publicaciones y las
 * escrituras (entrar, salir, borrar el grupo o una publicación). Es una función y no una clase porque depende del id
 * de la ruta: se crea en el contexto de inyección de la página (`groupStore(this.id)`).
 */
export function groupStore(id: Signal<string>) {
  const api = inject(CommunityApi);
  const auth = inject(AuthStore);
  const toaster = inject(Toaster);

  const group = api.group(id);
  const current = computed(() => (group.hasValue() ? group.value() : null));
  const viewer = computed<Viewer>(() => {
    const userId = auth.user()?.id ?? null;
    const value = current();
    return value ? viewerOf(value, userId) : { userId, member: false, owner: false };
  });
  /** Las publicaciones de un grupo privado solo las leen sus miembros. */
  const canRead = computed(() => current()?.visibility === 'PUBLIC' || viewer().member);

  const posts = pagedQuery({
    filters: computed<PostFilters>(() => ({ groupId: id() })),
    defaultSort: 'createdAt,desc',
    pageSize: PAGE_SIZE.feed,
    load: (request) => api.posts(computed(() => (canRead() ? request() : undefined))),
  });

  const join = mutation(() => api.join(id()), {
    success: (updated) =>
      updated.membership?.status === 'PENDING'
        ? { summary: 'Solicitud enviada', detail: 'Quien creó el grupo la revisará.' }
        : { summary: 'Ya eres miembro', detail: 'Ahora puedes publicar y comentar.' },
    onSuccess: (updated) => group.set(updated),
  });

  /** Sale del grupo o retira la solicitud pendiente (esto último sin preguntar). */
  const leave = mutation((value: GroupResponse) => api.leave(value.id), {
    confirm: (value) =>
      value.membership?.status === 'PENDING'
        ? null
        : {
            header: 'Salir del grupo',
            message:
              value.visibility === 'PRIVATE'
                ? 'Dejarás de ver sus publicaciones. Para volver tendrás que pedir entrar otra vez.'
                : 'Podrás volver a entrar cuando quieras.',
            acceptLabel: 'Salir',
            danger: true,
          },
    success: (_, value) =>
      value.membership?.status === 'PENDING' ? 'Solicitud retirada' : 'Has salido del grupo',
    onSuccess: (_, value) => {
      const pending = value.membership?.status === 'PENDING';
      group.set({
        ...value,
        membership: null,
        members: pending ? value.members : Math.max(0, value.members - 1),
      });
    },
  });

  const deleteGroup = mutation(() => api.deleteGroup(id()), {
    confirm: {
      header: 'Eliminar el grupo',
      message: 'Se borrarán el grupo, sus publicaciones y sus comentarios. No se puede deshacer.',
      acceptLabel: 'Eliminar',
      danger: true,
    },
    success: 'Grupo eliminado',
  });

  const deletePost = mutation((post: PostResponse) => api.deletePost(post.id), {
    confirm: (post) => ({
      header: 'Eliminar la publicación',
      message:
        post.author?.id === viewer().userId
          ? 'Se borrarán la publicación y sus comentarios.'
          : 'Como creador del grupo, puedes retirar publicaciones de otras personas. Se borrará con sus comentarios.',
      acceptLabel: 'Eliminar',
      danger: true,
    }),
    success: 'Publicación eliminada',
    onSuccess: () => posts.afterRemove(),
  });

  return {
    group,
    viewer,
    canRead,
    relation: computed(() => relationOf(current()?.membership)),
    membershipLabel: computed(() => membershipLabel(current()?.membership)),
    posts,
    join,
    leave,
    /** Entrando, saliendo o retirando la solicitud. */
    membershipPending: computed(() => join.pending() || leave.pending()),
    deleteGroup,
    deletePost,
    groupSaved(updated: GroupResponse): void {
      group.set(updated);
      toaster.success('Grupo actualizado');
    },
    /** Una publicación nueva sale la primera; una editada sigue en su página. */
    postSaved(post: PostResponse): void {
      const edited = posts.items().some((item) => item.id === post.id);
      toaster.success(edited ? 'Publicación actualizada' : 'Publicación creada');
      if (edited) {
        posts.reload();
      } else {
        posts.afterCreate();
      }
    },
  };
}

export type GroupStore = ReturnType<typeof groupStore>;
