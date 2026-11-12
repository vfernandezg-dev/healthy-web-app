import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { UploadMediaResponse } from '../../shared/models/upload-media-request.model';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private baseURL = `${inject(APP_CONFIG).apiUrl}/media`;
  private http = inject(HttpClient);

  constructor() {}

  upload(formData: FormData): Observable<UploadMediaResponse> {
    return this.http.post<UploadMediaResponse>(
      `${this.baseURL}/upload`,
      formData
    );
  }

  getMedia(filename: string): Observable<Blob> {
    const url = `${this.baseURL}/${filename}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
