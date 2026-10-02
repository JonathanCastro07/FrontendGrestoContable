import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api';
import {
  PagoPeriodicoRequest,
  PagoPeriodicoResponse,
} from '../models/pago-periodico';

@Injectable({
  providedIn: 'root',
})
export class PagoPeriodicoService {
  // ojo: el backend lo expone en plural
  private apiUrl = `${API_URL}/pagos-periodicos`;

  constructor(private http: HttpClient) {}

  crear(pago: PagoPeriodicoRequest): Observable<PagoPeriodicoResponse> {
    return this.http.post<PagoPeriodicoResponse>(this.apiUrl, pago);
  }

  listarPorNegocio(idNegocio: string): Observable<PagoPeriodicoResponse[]> {
    return this.http.get<PagoPeriodicoResponse[]>(`${this.apiUrl}/negocio/${idNegocio}`);
  }

  listarActivos(idNegocio: string): Observable<PagoPeriodicoResponse[]> {
    return this.http.get<PagoPeriodicoResponse[]>(`${this.apiUrl}/negocio/${idNegocio}/activos`);
  }

  listarProximos(idNegocio: string): Observable<PagoPeriodicoResponse[]> {
    return this.http.get<PagoPeriodicoResponse[]>(`${this.apiUrl}/negocio/${idNegocio}/proximos`);
  }

  buscarPorId(id: string): Observable<PagoPeriodicoResponse> {
    return this.http.get<PagoPeriodicoResponse>(`${this.apiUrl}/${id}`);
  }

  actualizar(id: string, pago: PagoPeriodicoRequest): Observable<PagoPeriodicoResponse> {
    return this.http.put<PagoPeriodicoResponse>(`${this.apiUrl}/${id}`, pago);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  ejecutarPago(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/ejecutar`, null);
  }

  listarPorPeriodo(
    idNegocio: string,
    mes: number,
    anio: number
  ): Observable<PagoPeriodicoResponse[]> {
    const params = { mes, anio };
    return this.http.get<PagoPeriodicoResponse[]>(
      `${this.apiUrl}/negocio/${idNegocio}/periodo`,
      { params }
    );
  }
}
