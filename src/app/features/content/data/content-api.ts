import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, type Signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '@core/api/api-config';
import { silentErrors } from '@core/api/http-context';
import type {
  ContentDetailResponse,
  ContentRequest,
  ContentSummaryResponse,
  EditableContentResponse,
  FileLinkResponse,
  PagedModelContentSummaryResponse,
  PublicationSummaryResponse,
} from '@core/api/schema';
import type { ContentCategory, ContentType, PublicationStatus } from '@shared/i18n/labels';
import { type PageRequest, pageParams } from '@shared/table/page-query';

export interface ContentFilters {
  readonly type: ContentType | null;
  readonly category: ContentCategory | null;
  /** Busca por título. */
  readonly q: string;
}

/** Contenido del nutricionista: todo, o solo el de un estado. */
export interface OwnContentFilters {
  readonly status: PublicationStatus | null;
}

/** Contenido: catálogo, detalle y fichero del cliente; gestión del nutricionista. */
@Injectable({ providedIn: 'root' })
export class ContentApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).apiUrl;

  // ---------------------------------------------------------------- cliente

  catalog(request: Signal<ContentFilters & PageRequest>) {
    return httpResource<PagedModelContentSummaryResponse>(() => {
      const { type, category, q, ...page } = request();
      return { url: `${this.api}/content-items`, params: pageParams(page, { type, category, q }) };
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

  /** Su contenido (en todos los estados, o en uno). Lo usan también el panel y el diálogo de recompensas. */
  mine(request: Signal<OwnContentFilters & PageRequest>) {
    return httpResource<PagedModelContentSummaryResponse>(() => {
      const { status, ...page } = request();
      return {
        url: `${this.api}/nutritionist/content-items`,
        params: pageParams(page, { status }),
      };
    });
  }

  /** Cuántos contenidos tiene en cada estado. */
  summary() {
    return httpResource<PublicationSummaryResponse>(
      () => `${this.api}/nutritionist/content-items/summary`,
    );
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
