import { Pipe, PipeTransform, inject } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';


@Pipe({
  name: 'apiImg',
  standalone: true
})
export class ApiImgPipe implements PipeTransform {
  private readonly apiUrl = inject(APP_CONFIG).apiUrl;


  transform(path: string): string {
    return `${this.apiUrl}/media/${path}`;
  }

}