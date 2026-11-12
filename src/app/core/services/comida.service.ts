import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComidaCreateUpdateRequest } from '../../shared/models/comida-create-update-request.model';
import { ComidaResponse } from '../../shared/models/comida-response.model';

@Injectable({
  providedIn: 'root',
})
export class ComidaService {
  private baseURL = `${inject(APP_CONFIG).apiUrl}/plan-alimenticio`;
  private http = inject(HttpClient);

  createComida(planId: number, comida: ComidaCreateUpdateRequest): Observable<ComidaResponse> {
    if (!planId || !comida) {
      throw new Error('El ID del plan o los datos de comida son inválidos');
    }
    return this.http.post<ComidaResponse>(`${this.baseURL}/${planId}/comidas`, comida);
  }

  getAllByPlanId(planId: number): Observable<ComidaResponse[]> {
    return this.http.get<ComidaResponse[]>(`${this.baseURL}/${planId}/comidas`);
  }

  getAllComidaByPlan(planId: number): Observable<ComidaResponse[]> {
    return this.http.get<ComidaResponse[]>(`${this.baseURL}/${planId}/comidas`);
  }

  getAllByNutricionistaId(nutricionistaId: number): Observable<ComidaResponse[]> {
    return this.http.get<ComidaResponse[]>(`${this.baseURL}/comidas/nutricionista/${nutricionistaId}`);
  }

  getComidaById(planId: number, comidaId: number): Observable<ComidaResponse> {
    return this.http.get<ComidaResponse>(`${this.baseURL}/${planId}/comidas/${comidaId}`);
  }
  
  deleteComida(planId: number, comidaId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseURL}/${planId}/comidas/${comidaId}`);
  }

  editComida(planId: number, comidaId: number, updateComida: ComidaCreateUpdateRequest): Observable<ComidaResponse> {
    return this.http.put<ComidaResponse>(`${this.baseURL}/${planId}/comidas/${comidaId}`, updateComida);
  }
}
