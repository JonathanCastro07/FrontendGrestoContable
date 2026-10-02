import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api';
import {
  MovimientoFinancieroRequest,
  MovimientoFinancieroResponse,
  MovimientoResumenResponse,
} from '../models/movimiento';

@Injectable({
  providedIn: 'root',
})
export class MovimientoService {
  private apiUrl = `${API_URL}/movimiento`;

  constructor(private http: HttpClient) {}

  registrar(movimiento: MovimientoFinancieroRequest): Observable<MovimientoFinancieroResponse> {
    return this.http.post<MovimientoFinancieroResponse>(`${this.apiUrl}/registro`, movimiento);
  }

  editar(id: string, movimiento: MovimientoFinancieroRequest): Observable<MovimientoFinancieroResponse> {
    return this.http.put<MovimientoFinancieroResponse>(`${this.apiUrl}/${id}`, movimiento);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarPorNegocio(idNegocio: string): Observable<MovimientoFinancieroResponse[]> {
    return this.http.get<MovimientoFinancieroResponse[]>(`${this.apiUrl}/negocio/${idNegocio}`);
  }

  listarPorNegocioYFecha(
    idNegocio: string,
    desde: string,
    hasta: string
  ): Observable<MovimientoFinancieroResponse[]> {
    const params = { desde, hasta };
    return this.http.get<MovimientoFinancieroResponse[]>(
      `${this.apiUrl}/negocio/${idNegocio}/fechas`,
      { params }
    );
  }

  listarPorPeriodo(
    idNegocio: string,
    mes: number,
    anio: number
  ): Observable<MovimientoFinancieroResponse[]> {
    const params = { mes, anio };
    return this.http.get<MovimientoFinancieroResponse[]>(
      `${this.apiUrl}/negocio/${idNegocio}/periodo`,
      { params }
    );
  }

  obtenerResumen(negocioId: string, periodo: string): Observable<MovimientoResumenResponse> {
    const params = { negocioId, periodo };
    return this.http.get<MovimientoResumenResponse>(`${this.apiUrl}/resumen`, { params });
  }
}
