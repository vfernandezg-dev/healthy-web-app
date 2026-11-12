import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { HttpClient } from '@angular/common/http';
import { PlanAlimenticioCreateUpdateRequest } from '../../shared/models/plan-alimenticio-create-update-request.model';
import { Observable } from 'rxjs';
import { PlanAlimenticioResponse } from '../../shared/models/plan-alimenticio-response.model';

@Injectable({
  providedIn: 'root'
})
export class PlanAlimenticioService {

  private baseURL = `${inject(APP_CONFIG).apiUrl}/plan-alimenticio`;
  private http = inject(HttpClient);

  getAllPlanAlimenticio(): Observable<PlanAlimenticioResponse[]> {
    return this.http.get<PlanAlimenticioResponse[]>(`${this.baseURL}`);
  }

  getPlanAlimenticio(id: number): Observable<PlanAlimenticioResponse[]> {
    return this.http.get<PlanAlimenticioResponse[]>(`${this.baseURL}/nutricionista/${id}`);
  }

  getPlanAlimenticioById(planId: number, nutricionistaId: number): Observable<PlanAlimenticioResponse> {
    return this.http.get<PlanAlimenticioResponse>(`${this.baseURL}/${planId}/nutricionista/${nutricionistaId}`);
  }

  getPlanById(planId: number): Observable<PlanAlimenticioResponse> {
    return this.http.get<PlanAlimenticioResponse>(`${this.baseURL}/${planId}`);
  }

  createPlanAlimenticio(planAlimenticio: PlanAlimenticioCreateUpdateRequest): Observable<PlanAlimenticioResponse> {
    return this.http.post<PlanAlimenticioResponse>(`${this.baseURL}`, planAlimenticio);
  }

  updatePlanAlimenticio(planId: number, updatedPlan: PlanAlimenticioCreateUpdateRequest, nutricionistaId: number): Observable<PlanAlimenticioResponse> {
    return this.http.put<PlanAlimenticioResponse>(`${this.baseURL}/${planId}/nutricionista/${nutricionistaId}`, updatedPlan);
  }  
  

  deletePlanAlimenticio(planId: number, nutricionistaId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseURL}/${planId}/nutricionista/${nutricionistaId}`);
  }
}