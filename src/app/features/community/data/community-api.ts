import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, type Signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '@core/api/api-config';
import { silentErrors } from '@core/api/http-context';
import type {
  CommentResponse,
  GroupRequest,
  GroupResponse,
  PagedModelCommentResponse,
  PagedModelGroupResponse,
  PagedModelMemberResponse,
  PagedModelPostResponse,
  PostRequest,
  PostResponse,
} from '@core/api/schema';
import { type PageRequest, pageParams } from '@shared/table/page-query';

export interface DirectoryFilters {
  /** Busca por nombre. */
  readonly q: string;
}

export const POST_PAGE_SIZE = 10;
export const COMMENT_PAGE_SIZE = 20;
export const MEMBER_PAGE_SIZE = 20;

/** Publicación o comentario que se denuncia. */
export interface ReportTarget {
  readonly kind: 'posts' | 'comments';
  readonly id: string;
}

/** Comunidad: grupos, membresías, publicaciones, comentarios y denuncias. */
@Injectable({ providedIn: 'root' })
export class CommunityApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).apiUrl;

  // ---------------------------------------------------------------- grupos

  directory(request: Signal<DirectoryFilters & PageRequest>) {
    return httpResource<PagedModelGroupResponse>(() => {
      const { q, ...page } = request();
      return { url: `${this.api}/groups`, params: pageParams(page, { q }) };
    });
  }

  group(id: Signal<string>) {
    return httpResource<GroupResponse>(() => `${this.api}/groups/${id()}`);
  }

  createGroup(body: GroupRequest): Promise<GroupResponse> {
    return firstValueFrom(
      this.http.post<GroupResponse>(`${this.api}/groups`, body, { context: silentErrors() }),
    );
  }

  updateGroup(id: string, body: GroupRequest): Promise<GroupResponse> {
    return firstValueFrom(
      this.http.put<GroupResponse>(`${this.api}/groups/${id}`, body, { context: silentErrors() }),
    );
  }

  deleteGroup(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.api}/groups/${id}`));
  }

  // ---------------------------------------------------------------- membresías

  /** Entra en un grupo público o pide entrar en uno privado. */
  join(groupId: string): Promise<GroupResponse> {
    return firstValueFrom(
      this.http.post<GroupResponse>(`${this.api}/groups/${groupId}/members`, null),
    );
  }

  /** 409 `owner-cannot-leave` para el creador. */
  leave(groupId: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.api}/groups/${groupId}/members/me`));
  }

  /** Por orden de llegada. El creador ve también las solicitudes pendientes (entre los demás, por su fecha). */
  members(query: Signal<{ groupId: string; page: number }>) {
    return httpResource<PagedModelMemberResponse>(() => {
      const { groupId, page } = query();
      return {
        url: `${this.api}/groups/${groupId}/members`,
        params: { page, size: MEMBER_PAGE_SIZE, sort: 'createdAt,asc' },
      };
    });
  }

  approve(groupId: string, userId: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.api}/groups/${groupId}/members/${userId}/approve`, null),
    );
  }

  /** Rechaza una solicitud o expulsa a un miembro. */
  remove(groupId: string, userId: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.api}/groups/${groupId}/members/${userId}`),
    );
  }

  // ---------------------------------------------------------------- publicaciones

  /** 403 `private-group` si el grupo es privado y no se es miembro activo. */
  posts(query: Signal<{ groupId: string; page: number } | undefined>) {
    return httpResource<PagedModelPostResponse>(() => {
      const value = query();
      return value
        ? {
            url: `${this.api}/groups/${value.groupId}/posts`,
            params: { page: value.page, size: POST_PAGE_SIZE, sort: 'createdAt,desc' },
          }
        : undefined;
    });
  }

  publish(groupId: string, body: PostRequest): Promise<PostResponse> {
    return firstValueFrom(
      this.http.post<PostResponse>(`${this.api}/groups/${groupId}/posts`, body, {
        context: silentErrors(),
      }),
    );
  }

  editPost(id: string, body: PostRequest): Promise<PostResponse> {
    return firstValueFrom(
      this.http.put<PostResponse>(`${this.api}/posts/${id}`, body, { context: silentErrors() }),
    );
  }

  deletePost(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.api}/posts/${id}`));
  }

  /** Comentarios de una publicación, del más antiguo al más nuevo. Sin publicación, no pide nada. */
  comments(query: Signal<{ postId: string; page: number } | undefined>) {
    return httpResource<PagedModelCommentResponse>(() => {
      const value = query();
      return value
        ? {
            url: `${this.api}/posts/${value.postId}/comments`,
            params: { page: value.page, size: COMMENT_PAGE_SIZE, sort: 'createdAt,asc' },
          }
        : undefined;
    });
  }

  comment(postId: string, body: string): Promise<CommentResponse> {
    return firstValueFrom(
      this.http.post<CommentResponse>(`${this.api}/posts/${postId}/comments`, { body }),
    );
  }

  deleteComment(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.api}/comments/${id}`));
  }

  /** 409 `already-reported` si ya lo denunció. Lo revisa un ADMIN. */
  report({ kind, id }: ReportTarget, reason: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(
        `${this.api}/${kind}/${id}/reports`,
        { reason },
        { context: silentErrors() },
      ),
    );
  }
}
