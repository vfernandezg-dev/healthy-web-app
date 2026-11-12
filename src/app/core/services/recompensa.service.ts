import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { RecompensaCreateRequest } from '../../shared/models/recompensa-create-request.model';
import { Observable } from 'rxjs';
import { RecompensaResponse } from '../../shared/models/recompensa-response.model';

@Injectable({
  providedIn: 'root'
})
export class RecompensaService {

    private baseURL = `${inject(APP_CONFIG).apiUrl}/recompensa`;
    private http = inject(HttpClient);

    createRecompensa(recompensa: RecompensaCreateRequest): Observable<RecompensaResponse> {
        return this.http.post<RecompensaResponse>(`${this.baseURL}`, recompensa);
    }

    updateRecompensa(recompensaId: number, recompensa: RecompensaCreateRequest): Observable<RecompensaResponse> {
        return this.http.put<RecompensaResponse>(`${this.baseURL}/${recompensaId}`, recompensa);
    }

    deleteRecompensa(recompensaId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseURL}/${recompensaId}`);
    }

    getRecompensaById(recompensaId: number): Observable<RecompensaResponse> {
        return this.http.get<RecompensaResponse>(`${this.baseURL}/${recompensaId}`);
    }

    getAllRecompensas(): Observable<RecompensaResponse[]> {
        return this.http.get<RecompensaResponse[]>(`${this.baseURL}`);
    }
}
