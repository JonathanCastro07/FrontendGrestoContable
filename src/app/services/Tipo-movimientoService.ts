import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api';
import { TipoMovimientoRequest, TipoMovimientoResponse } from '../models/tipo-movimiento';

@Injectable({
  providedIn: 'root',
})
export class TipoMovimientoService {
  private apiUrl = `${API_URL}/tipo-movimiento`;

  constructor(private http: HttpClient) {}

  crear(tipo: TipoMovimientoRequest): Observable<TipoMovimientoResponse> {
    return this.http.post<TipoMovimientoResponse>(this.apiUrl, tipo);
  }

  listarTodo(): Observable<TipoMovimientoResponse[]> {
    return this.http.get<TipoMovimientoResponse[]>(this.apiUrl);
  }

  buscarPorId(id: string): Observable<TipoMovimientoResponse> {
    return this.http.get<TipoMovimientoResponse>(`${this.apiUrl}/${id}`);
  }

  actualizar(id: string, tipo: TipoMovimientoRequest): Observable<TipoMovimientoResponse> {
    return this.http.put<TipoMovimientoResponse>(`${this.apiUrl}/${id}`, tipo);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}