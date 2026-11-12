import { HttpClient, type HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, filter, map } from 'rxjs';
import { APP_CONFIG } from '../../core/api/api-config';
import { silentErrors } from '../../core/api/http-context';
import type { UploadResponse } from '../../core/api/schema';

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
        reportProgress: true,
        observe: 'events',
        context: silentErrors(),
      })
      .pipe(
        filter(
          (event: HttpEvent<UploadResponse>) =>
            event.type === HttpEventType.UploadProgress || event.type === HttpEventType.Response,
        ),
        map((event): UploadProgress => {
          if (event.type === HttpEventType.Response) {
            return { state: 'done', file: event.body as UploadResponse };
          }
          const total = event.type === HttpEventType.UploadProgress ? (event.total ?? 0) : 0;
          const loaded = event.type === HttpEventType.UploadProgress ? event.loaded : 0;
          return {
            state: 'uploading',
            percent: total > 0 ? Math.round((loaded / total) * 100) : 0,
          };
        }),
      );
  }
}
