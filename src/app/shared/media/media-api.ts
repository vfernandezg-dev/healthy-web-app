import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  type HttpEvent,
  HttpEventType,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  type Observable,
  catchError,
  concat,
  defer,
  filter,
  map,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { APP_CONFIG } from '@core/api/api-config';
import { silentErrors } from '@core/api/http-context';
import type {
  CompleteUploadRequest,
  DirectUploadRequest,
  DirectUploadResponse,
  UploadResponse,
} from '@core/api/schema';

export type MediaPurpose = 'POST_IMAGE' | 'CONTENT_COVER' | 'CONTENT_FILE';

/** Avance de una subida: porcentaje mientras sube y la respuesta al terminar. */
export type UploadProgress =
  | { readonly state: 'uploading'; readonly percent: number }
  | { readonly state: 'done'; readonly file: UploadResponse };

/**
 * Subida de ficheros. El tipo real lo comprueba la API por los bytes.
 *
 * - Con almacenamiento de objetos (producción): el fichero va directamente al almacenamiento con una URL prefirmada
 *   (POST /media/uploads), sin pasar por la API, que en Vercel no admite peticiones de más de 4,5 MB; después se
 *   confirma (POST /media/uploads/complete).
 * - Si la API no ofrece subidas directas (responde 501, como con el almacenamiento en disco de desarrollo), se sube a
 *   POST /media.
 */
@Injectable({ providedIn: 'root' })
export class MediaApi {
  private readonly http = inject(HttpClient);
  /** Sin interceptores: al almacenamiento no viajan el token ni las cabeceras propias de la API. */
  private readonly storage = new HttpClient(inject(HttpBackend));
  private readonly url = `${inject(APP_CONFIG).apiUrl}/media`;

  upload(file: File, purpose: MediaPurpose): Observable<UploadProgress> {
    const body: DirectUploadRequest = { purpose, contentType: file.type, sizeBytes: file.size };
    return this.http
      .post<DirectUploadResponse>(`${this.url}/uploads`, body, { context: silentErrors() })
      .pipe(
        catchError((error: unknown) =>
          isDirectUploadUnavailable(error) ? of(null) : throwError(() => error),
        ),
        switchMap((ticket) =>
          ticket ? this.uploadDirectly(file, ticket) : this.uploadThroughApi(file, purpose),
        ),
      );
  }

  /** PUT al almacenamiento (con el tipo firmado) y confirmación en la API. */
  private uploadDirectly(file: File, ticket: DirectUploadResponse): Observable<UploadProgress> {
    const put = this.storage
      .put(ticket.uploadUrl, file, {
        headers: { 'Content-Type': ticket.contentType },
        reportUploadProgress: true,
        observe: 'events',
      })
      .pipe(
        map(toUploadPercent),
        filter((progress) => progress !== null),
      );
    const complete = defer(() =>
      this.http.post<UploadResponse>(
        `${this.url}/uploads/complete`,
        { ticket: ticket.ticket } satisfies CompleteUploadRequest,
        { context: silentErrors() },
      ),
    ).pipe(map((uploaded): UploadProgress => ({ state: 'done', file: uploaded })));
    return concat(put, complete);
  }

  private uploadThroughApi(file: File, purpose: MediaPurpose): Observable<UploadProgress> {
    const body = new FormData();
    body.append('file', file);
    return this.http
      .post<UploadResponse>(this.url, body, {
        params: { purpose },
        // Avance de la subida: necesita el backend XHR (withXhr() en app.config.ts).
        reportUploadProgress: true,
        observe: 'events',
        context: silentErrors(),
      })
      .pipe(
        map(toProgress),
        filter((progress) => progress !== null),
      );
  }
}

/** La API no ofrece subidas directas (501): se sube a POST /media. */
function isDirectUploadUnavailable(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 501;
}

function toUploadPercent(event: HttpEvent<unknown>): UploadProgress | null {
  return event.type === HttpEventType.UploadProgress
    ? {
        state: 'uploading',
        percent: event.total ? Math.round((event.loaded / event.total) * 100) : 0,
      }
    : null;
}

function toProgress(event: HttpEvent<UploadResponse>): UploadProgress | null {
  switch (event.type) {
    case HttpEventType.UploadProgress:
      return toUploadPercent(event);
    case HttpEventType.Response:
      if (!event.body) {
        throw new Error('La API no ha devuelto el fichero subido.');
      }
      return { state: 'done', file: event.body };
    default:
      return null;
  }
}
