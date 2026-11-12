import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { ClienteResponse } from '../../shared/models/cliente-response.model';

@Injectable({
  providedIn: 'root'
})
export class GestionarPerfilService {

    private baseUrl = `${inject(APP_CONFIG).apiUrl}/admin/cliente`;
    private http = inject(HttpClient);

    getAllClientes(): Observable<ClienteResponse[]> {
        return this.http.get<ClienteResponse[]>(`${this.baseUrl}`);
    }
  
}
