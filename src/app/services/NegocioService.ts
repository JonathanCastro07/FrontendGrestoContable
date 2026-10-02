import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api';
import { NegocioRequest, NegocioResponse, ResumenFinanciero } from '../models/negocio';

@Injectable({
  providedIn: 'root',
})
export class NegocioService {
  private apiUrl = `${API_URL}/negocio`;

  constructor(private http: HttpClient) {}

  crear(negocio: NegocioRequest): Observable<NegocioResponse> {
    return this.http.post<NegocioResponse>(`${this.apiUrl}/crear`, negocio);
  }

  listarPorUsuario(idUsuario: string): Observable<NegocioResponse[]> {
    return this.http.get<NegocioResponse[]>(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  actualizar(id: string, negocio: NegocioRequest): Observable<NegocioResponse> {
    return this.http.put<NegocioResponse>(`${this.apiUrl}/${id}`, negocio);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  calcularUtilidad(id: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${id}/utilidad`);
  }

  verResumenFinanciero(id: string): Observable<ResumenFinanciero> {
    return this.http.get<ResumenFinanciero>(`${this.apiUrl}/${id}/financiero`);
  }
}
