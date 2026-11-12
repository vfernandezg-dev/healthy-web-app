import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HabitoCreateRequest } from '../../shared/models/habito-create-request.model';
import { HabitoResponse } from '../../shared/models/habito-response.model';

@Injectable({
  providedIn: 'root'
})
export class HabitoService {

    private baseURL = `${inject(APP_CONFIG).apiUrl}/habito`;
    private http = inject(HttpClient);

    crearHabito(habito: HabitoCreateRequest): Observable<HabitoResponse> {
        return this.http.post<HabitoResponse>(`${this.baseURL}`, habito);
    }

    actualizarHabito(habitoId: number, updateHabito: HabitoCreateRequest): Observable<HabitoResponse> {
        return this.http.put<HabitoResponse>(`${this.baseURL}/${habitoId}`, updateHabito)
    }

    eliminarHabito(habitoId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseURL}/${habitoId}`);
    }

    getAllHabitosByClienteId(clienteId: number): Observable<HabitoResponse[]> {
        return this.http.get<HabitoResponse[]>(`${this.baseURL}/cliente/${clienteId}`);
    }

    getHabitoById(habitoId: number): Observable<HabitoResponse> {
        return this.http.get<HabitoResponse>(`${this.baseURL}/${habitoId}`);
    }
}
