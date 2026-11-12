import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlanAlimenticioResponse } from '../../shared/models/plan-alimenticio-response.model';

@Injectable({
  providedIn: 'root'
})
export class AccesoPlanService {

    private baseURL = `${inject(APP_CONFIG).apiUrl}/acceso-contenido`;
    private http = inject(HttpClient);

    addPlanAlimenticioToCliente(planAlimenticioId: number, clienteId: number): Observable<PlanAlimenticioResponse> {
        return this.http.post<PlanAlimenticioResponse>(`${this.baseURL}/${planAlimenticioId}/cliente/${clienteId}`, null);
    }

    isClientePremiumOrVip(clienteId: number): Observable<boolean> {
        return this.http.get<boolean>(`${this.baseURL}/${clienteId}/is-premium-or-vip`);
    }
}