import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, type Signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '../../../core/api/api-config';
import { silentErrors } from '../../../core/api/http-context';
import type {
  ContentDetailResponse,
  ContentRequest,
  ContentSummaryResponse,
  EditableContentResponse,
  FileLinkResponse,
  PagedModelContentSummaryResponse,
} from '../../../core/api/schema';
import type { ContentCategory, ContentType } from '../../../shared/i18n/labels';

export const CONTENT_PAGE_SIZE = 12;

export interface ContentQuery {
  readonly type: ContentType | null;
  readonly category: ContentCategory | null;
  readonly search: string;
  readonly page: number;
}

/** Contenido: catálogo, detalle y fichero del cliente; gestión del nutricionista. */
@Injectable({ providedIn: 'root' })
export class ContentApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).apiUrl;

  // ---------------------------------------------------------------- cliente

  catalog(query: Signal<ContentQuery>) {
    return httpResource<PagedModelContentSummaryResponse>(() => {
      const { type, category, search, page } = query();
      return {
        url: `${this.api}/content-items`,
        params: {
          page,
          size: CONTENT_PAGE_SIZE,
          sort: 'publishedAt,desc',
          ...(type ? { type } : {}),
          ...(category ? { category } : {}),
          ...(search.trim() ? { q: search.trim() } : {}),
        },
      };
    });
  }

  /** 403 `subscription-required` (con `requiredTier`) si el contenido está bloqueado. */
  detail(slug: Signal<string>) {
    return httpResource<ContentDetailResponse>(() => `${this.api}/content-items/${slug()}`);
  }

  /** Lo desbloqueado con recompensas. */
  unlocks() {
    return httpResource<ContentSummaryResponse[]>(() => `${this.api}/me/content-unlocks`);
  }

  /** Enlace firmado y de vida corta al fichero (ruta relativa a la API). */
  fileLink(id: string): Promise<FileLinkResponse> {
    return firstValueFrom(this.http.get<FileLinkResponse>(`${this.api}/content-items/${id}/file`));
  }

  // ---------------------------------------------------------------- nutricionista

  mine(page: Signal<number>) {
    return httpResource<PagedModelContentSummaryResponse>(() => ({
      url: `${this.api}/nutritionist/content-items`,
      params: { page: page(), size: 20, sort: 'updatedAt,desc' },
    }));
  }

  own(id: Signal<string>) {
    return httpResource<EditableContentResponse>(
      () => `${this.api}/nutritionist/content-items/${id()}`,
    );
  }

  create(body: ContentRequest): Promise<EditableContentResponse> {
    return firstValueFrom(
      this.http.post<EditableContentResponse>(`${this.api}/nutritionist/content-items`, body, {
        context: silentErrors(),
      }),
    );
  }

  update(id: string, body: ContentRequest): Promise<EditableContentResponse> {
    return firstValueFrom(
      this.http.put<EditableContentResponse>(`${this.api}/nutritionist/content-items/${id}`, body, {
        context: silentErrors(),
      }),
    );
  }

  publish(id: string): Promise<EditableContentResponse> {
    return firstValueFrom(
      this.http.post<EditableContentResponse>(
        `${this.api}/nutritionist/content-items/${id}/publish`,
        null,
      ),
    );
  }

  archive(id: string): Promise<EditableContentResponse> {
    return firstValueFrom(
      this.http.post<EditableContentResponse>(
        `${this.api}/nutritionist/content-items/${id}/archive`,
        null,
      ),
    );
  }

  delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.api}/nutritionist/content-items/${id}`));
  }
}
