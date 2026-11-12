import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { Observable } from 'rxjs';
import { ComentarioRequest } from '../../shared/models/comentario-request.model';
import { ComentarioResponse } from '../../shared/models/comentario-response.model';

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {

    private baseUrl = `${inject(APP_CONFIG).apiUrl}/publicacion`;
    private http = inject(HttpClient);

    crearComentario(publicacionId: number, comentario: ComentarioRequest): Observable<ComentarioResponse> {
        return this.http.post<ComentarioResponse>(`${this.baseUrl}/${publicacionId}/comentario`, comentario);
    }

    getAllComentariosByPublicacionId(publicacionId: number): Observable<ComentarioResponse[]> {
        return this.http.get<ComentarioResponse[]>(`${this.baseUrl}/${publicacionId}/comentario`);
    }

    

}
