import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, type Signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '../../../core/api/api-config';
import { silentErrors } from '../../../core/api/http-context';
import type {
  CommentResponse,
  GroupRequest,
  GroupResponse,
  MemberResponse,
  PagedModelGroupResponse,
  PagedModelPostResponse,
  PostRequest,
  PostResponse,
} from '../../../core/api/schema';

export const GROUP_PAGE_SIZE = 12;
export const POST_PAGE_SIZE = 10;

/** Comunidad: grupos, membresías, publicaciones, comentarios y denuncias. */
@Injectable({ providedIn: 'root' })
export class CommunityApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).apiUrl;

  // ---------------------------------------------------------------- grupos

  directory(query: Signal<{ search: string; page: number }>) {
    return httpResource<PagedModelGroupResponse>(() => {
      const { search, page } = query();
      return {
        url: `${this.api}/groups`,
        params: {
          page,
          size: GROUP_PAGE_SIZE,
          sort: 'createdAt,desc',
          ...(search.trim() ? { q: search.trim() } : {}),
        },
      };
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

  /** El creador ve también las solicitudes pendientes. Sin grupo, no pide nada. */
  members(groupId: Signal<string | undefined>) {
    return httpResource<MemberResponse[]>(() => {
      const id = groupId();
      return id ? `${this.api}/groups/${id}/members` : undefined;
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
  comments(postId: Signal<string | undefined>) {
    return httpResource<CommentResponse[]>(() => {
      const id = postId();
      return id ? `${this.api}/posts/${id}/comments` : undefined;
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
  report(target: 'posts' | 'comments', id: string, reason: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(
        `${this.api}/${target}/${id}/reports`,
        { reason },
        { context: silentErrors() },
      ),
    );
  }
}
