import { HttpClient, HttpParams } from '@angular/common/http';
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

  registrarMovimiento(movimiento: MovimientoFinancieroRequest): Observable<MovimientoFinancieroResponse> {
    return this.http.post<MovimientoFinancieroResponse>(`${this.apiUrl}/registro`, movimiento);
  }

  editarMovimiento(idMovimiento: string, movimiento: MovimientoFinancieroRequest): Observable<MovimientoFinancieroResponse> {
    return this.http.put<MovimientoFinancieroResponse>(`${this.apiUrl}/${idMovimiento}`, movimiento);
  }

  eliminarMovimiento(idMovimiento: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idMovimiento}`);
  }

  listarPorNegocio(idNegocio: string): Observable<MovimientoFinancieroResponse[]> {
    return this.http.get<MovimientoFinancieroResponse[]>(`${this.apiUrl}/negocio/${idNegocio}`);
  }

  listarPorNegocioYFecha(idNegocio: string, desde: string, hasta: string): Observable<MovimientoFinancieroResponse[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<MovimientoFinancieroResponse[]>(`${this.apiUrl}/negocio/${idNegocio}/fechas`, { params });
  }

  listarPorPeriodo(idNegocio: string, mes: string, anio: number): Observable<MovimientoFinancieroResponse[]> {
    const params = new HttpParams().set('mes', mes).set('anio', anio);
    return this.http.get<MovimientoFinancieroResponse[]>(`${this.apiUrl}/negocio/${idNegocio}/periodo`, { params });
  }

  obtenerResumen(negocioId: string, periodo: string): Observable<MovimientoResumenResponse> {
    const params = new HttpParams().set('negocioId', negocioId).set('periodo', periodo);
    return this.http.get<MovimientoResumenResponse>(`${this.apiUrl}/resumen`, { params });
  }
}