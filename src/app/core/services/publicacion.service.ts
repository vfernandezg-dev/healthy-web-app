import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HabitoCreateRequest } from '../../shared/models/habito-create-request.model';
import { HabitoResponse } from '../../shared/models/habito-response.model';
import { PublicacionResponse } from '../../shared/models/publicacion-response.model';
import { PublicacionCreateRequest } from '../../shared/models/publicacion-create-request.model';

@Injectable({
  providedIn: 'root'
})
export class PublicacionService {

    private baseURL = `${inject(APP_CONFIG).apiUrl}/publicacion`;
    private http = inject(HttpClient);
    private publicacionId?: number;

    getAllPublicaciones(): Observable<PublicacionResponse[]> {
        return this.http.get<PublicacionResponse[]>(`${this.baseURL}`);
    }

    getAllPublicacionesByClienteId(clienteId: number): Observable<PublicacionResponse[]> {
        return this.http.get<PublicacionResponse[]>(`${this.baseURL}/cliente/${clienteId}`);
    }

    getPublicacionById(publicacionId: number, clienteId: number): Observable<PublicacionResponse> {
        return this.http.get<PublicacionResponse>(`${this.baseURL}/${publicacionId}/cliente/${clienteId}`); 
    }

    getPublicacionByGrupoId(grupoId: number): Observable<PublicacionResponse[]> {
        return this.http.get<PublicacionResponse[]>(`${this.baseURL}/grupo/${grupoId}`);
    }

    crearPublicacion(publicacion: PublicacionCreateRequest): Observable<PublicacionResponse> {
        return this.http.post<PublicacionResponse>(`${this.baseURL}`, publicacion);
    }

    actualizarPublicacion(publicacionId: number, clienteId: number, updatePublicacion: PublicacionCreateRequest): Observable<PublicacionResponse> {
        return this.http.put<PublicacionResponse>(`${this.baseURL}/${publicacionId}/cliente/${clienteId}`, updatePublicacion)
    }

    eliminarPublicacion(publicacionId: number, clienteId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseURL}/${publicacionId}/cliente/${clienteId}`);
    }

    setPublicacionId(publicacionId: number): void {
        this.publicacionId = publicacionId;
    }

    getPublicacionId(): number {
        return Number(this.publicacionId);
    }
}
