import { Pipe, type PipeTransform, inject } from '@angular/core';
import { APP_CONFIG } from '@core/api/api-config';

/** URL completa de un fichero de la API a partir de su ruta (`/media/{id}`, firmada o no). */
@Pipe({ name: 'mediaUrl' })
export class MediaUrlPipe implements PipeTransform {
  private readonly api = inject(APP_CONFIG).apiUrl;

  transform(path: string | null | undefined): string | null {
    return path ? `${this.api}${path}` : null;
  }
}
