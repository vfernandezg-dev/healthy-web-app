import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { Observable } from 'rxjs';
import { SeguimientoRequest } from '../../shared/models/seguimiento-request.model';
import { SeguimientoResponse } from '../../shared/models/seguimiento-response.model';
import { PageableResponse } from '../../shared/models/pageable-response.model';

@Injectable({
  providedIn: 'root'
})
export class SeguimientoService {

    private baseURL = `${inject(APP_CONFIG).apiUrl}/meta`;
    private http = inject(HttpClient);

    crearSeguimiento(metaId: number, seguimiento: SeguimientoRequest): Observable<SeguimientoResponse> {
        return this.http.post<SeguimientoResponse>(`${this.baseURL}/${metaId}/seguimientos`, seguimiento);
    }

    actualizarSeguimiento(metaId: number, seguimientoId: number, seguimiento: SeguimientoRequest): Observable<SeguimientoResponse> {
        return this.http.put<SeguimientoResponse>(`${this.baseURL}/${metaId}/seguimientos/${seguimientoId}`, seguimiento);
    }

    eliminarSeguimiento(metaId: number, seguimientoId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseURL}/${metaId}/seguimientos/${seguimientoId}`);
    }

    getAllSeguimientosByMetaId(metaId: number): Observable<SeguimientoResponse[]> {
        return this.http.get<SeguimientoResponse[]>(`${this.baseURL}/${metaId}/seguimientos`);
    }

    getSeguimientoById(metaId: number, seguimientoId: number): Observable<SeguimientoResponse> {
        return this.http.get<SeguimientoResponse>(`${this.baseURL}/${metaId}/seguimientos/${seguimientoId}`);
    }


    paginateSeguimientosByClienteId(metaId: number, clienteId: number, page: number, size: number): Observable<PageableResponse<SeguimientoResponse>> {
        const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
        return this.http.get<PageableResponse<SeguimientoResponse>>(`${this.baseURL}/${metaId}/seguimientos/cliente/${clienteId}/page`,
            { params });
    }

    getAllSeguimiento(metaId: number, clienteId: number): Observable<SeguimientoResponse[]> {
        return this.http.get<SeguimientoResponse[]>(`${this.baseURL}/${metaId}/seguimientos/cliente/${clienteId}`);
    }
}
