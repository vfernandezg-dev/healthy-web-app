import { HttpClient, type HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, filter, map } from 'rxjs';
import { APP_CONFIG } from '@core/api/api-config';
import { silentErrors } from '@core/api/http-context';
import type { UploadResponse } from '@core/api/schema';

export type MediaPurpose = 'POST_IMAGE' | 'CONTENT_COVER' | 'CONTENT_FILE';

/** Avance de una subida: porcentaje mientras sube y la respuesta al terminar. */
export type UploadProgress =
  | { readonly state: 'uploading'; readonly percent: number }
  | { readonly state: 'done'; readonly file: UploadResponse };

/** Subida de ficheros (POST /media). El tipo real lo detecta la API por los bytes. */
@Injectable({ providedIn: 'root' })
export class MediaApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(APP_CONFIG).apiUrl}/media`;

  upload(file: File, purpose: MediaPurpose): Observable<UploadProgress> {
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

function toProgress(event: HttpEvent<UploadResponse>): UploadProgress | null {
  switch (event.type) {
    case HttpEventType.UploadProgress:
      return {
        state: 'uploading',
        percent: event.total ? Math.round((event.loaded / event.total) * 100) : 0,
      };
    case HttpEventType.Response:
      if (!event.body) {
        throw new Error('La API no ha devuelto el fichero subido.');
      }
      return { state: 'done', file: event.body };
    default:
      return null;
  }
}
