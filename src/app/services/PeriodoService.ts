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

  listarTodos(): Observable<PeriodoResponse[]> {
    return this.http.get<PeriodoResponse[]>(this.apiUrl);
  }

  buscarPorId(id: string): Observable<PeriodoResponse> {
    return this.http.get<PeriodoResponse>(`${this.apiUrl}/${id}`);
  }

  actualizar(id: string, periodo: PeriodoRequest): Observable<PeriodoResponse> {
    return this.http.put<PeriodoResponse>(`${this.apiUrl}/${id}`, periodo);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
