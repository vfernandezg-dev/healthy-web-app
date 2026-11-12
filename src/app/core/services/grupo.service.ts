import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { GrupoCreateRequestModel } from '../../shared/models/grupo-create-request-mode';
import { Observable } from 'rxjs';
import { GrupoResponse } from '../../shared/models/grupo-response.model';

@Injectable({
  providedIn: 'root'
})
export class GrupoService {

    private baseUrl = `${inject(APP_CONFIG).apiUrl}/grupo`;
    private http = inject(HttpClient);

    getAllGrupoByClienteId(clienteId: number): Observable<GrupoResponse[]> {
        return this.http.get<GrupoResponse[]>(`${this.baseUrl}/cliente/${clienteId}`);
    }

    getAllGrupos(): Observable<GrupoResponse[]> {
        return this.http.get<GrupoResponse[]>(`${this.baseUrl}`);
    }

    getGrupoById(grupoId: number): Observable<GrupoResponse> {
        return this.http.get<GrupoResponse>(`${this.baseUrl}/${grupoId}`);
    }

    createGrupo(grupo: GrupoCreateRequestModel): Observable<GrupoResponse> {
        return this.http.post<GrupoResponse>(`${this.baseUrl}`, grupo);
    }

    editarGrupo(grupo: GrupoCreateRequestModel, grupoId: number, clienteId: number): Observable<GrupoResponse> {
        return this.http.put<GrupoResponse>(`${this.baseUrl}/${grupoId}/cliente/${clienteId}`, grupo);
    }

    eliminarGrupo(grupoId: number, clienteId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${grupoId}/cliente/${clienteId}`);
    }

    
}
