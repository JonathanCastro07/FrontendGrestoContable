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

  buscarPorId(idNegocio: string): Observable<NegocioResponse> {
    return this.http.get<NegocioResponse>(`${this.apiUrl}/${idNegocio}`);
  }

  actualizar(idNegocio: string, negocio: NegocioRequest): Observable<NegocioResponse> {
    return this.http.put<NegocioResponse>(`${this.apiUrl}/${idNegocio}`, negocio);
  }

  eliminar(idNegocio: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idNegocio}`);
  }

  calcularUtilidad(idNegocio: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${idNegocio}/utilidad`);
  }

  verResumenFinanciero(idNegocio: string): Observable<ResumenFinanciero> {
    return this.http.get<ResumenFinanciero>(`${this.apiUrl}/${idNegocio}/financiero`);
  }
}