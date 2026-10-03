import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api';
import { PeriodoRequest, PeriodoResponse } from '../models/periodo';

@Injectable({
  providedIn: 'root',
})
export class PeriodoService {
  private apiUrl = `${API_URL}/periodo`;

  constructor(private http: HttpClient) {}

  crear(periodo: PeriodoRequest): Observable<PeriodoResponse> {
    return this.http.post<PeriodoResponse>(this.apiUrl, periodo);
  }

  listarTodo(): Observable<PeriodoResponse[]> {
    return this.http.get<PeriodoResponse[]>(this.apiUrl);
  }

  buscarPorId(idPeriodo: string): Observable<PeriodoResponse> {
    return this.http.get<PeriodoResponse>(`${this.apiUrl}/${idPeriodo}`);
  }

  actualizar(idPeriodo: string, periodo: PeriodoRequest): Observable<PeriodoResponse> {
    return this.http.put<PeriodoResponse>(`${this.apiUrl}/${idPeriodo}`, periodo);
  }

  eliminar(idPeriodo: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idPeriodo}`);
  }
}