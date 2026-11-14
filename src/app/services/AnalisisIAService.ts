import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api';
import { AnalisisIAResponse, PeriodoAnalisis } from '../models/analisis-ia';

@Injectable({
  providedIn: 'root',
})
export class AnalisisIAService {
  private apiUrl = `${API_URL}/analisis`;

  constructor(private http: HttpClient) {}

  generar(negocioId: string, periodo: PeriodoAnalisis): Observable<AnalisisIAResponse> {
    const params = new HttpParams().set('periodo', periodo);
    return this.http.post<AnalisisIAResponse>(`${this.apiUrl}/negocio/${negocioId}`, null, { params });
  }

  listar(negocioId: string): Observable<AnalisisIAResponse[]> {
    return this.http.get<AnalisisIAResponse[]>(`${this.apiUrl}/negocio/${negocioId}`);
  }
}
