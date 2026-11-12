import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecompensaResponse } from '../../shared/models/recompensa-response.model';

@Injectable({
  providedIn: 'root'
})
export class RachaService {

    private baseURL = `${inject(APP_CONFIG).apiUrl}/racha`;
    private http = inject(HttpClient);

    addRecompensaToCliente(clienteId: number, recompensaId: number): Observable<RecompensaResponse> {
        return this.http.post<RecompensaResponse>(`${this.baseURL}/${clienteId}/recompensa/${recompensaId}`, {});
    }

    deleteRecompensaFromCliente(clienteId: number, recompensaId: number): Observable<RecompensaResponse> {
        return this.http.delete<RecompensaResponse>(`${this.baseURL}/${clienteId}/remove/${recompensaId}`);
    }

    getAllRecompensasByClienteId(clienteId: number): Observable<RecompensaResponse[]> {
        return this.http.get<RecompensaResponse[]>(`${this.baseURL}/${clienteId}/all-recompensas`);
    }
}
