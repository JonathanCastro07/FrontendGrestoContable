import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api';
import { GraficoMensualResponse } from '../models/grafico';

@Injectable({
  providedIn: 'root',
})
export class GraficoService {
  private apiUrl = `${API_URL}/grafico`;

  constructor(private http: HttpClient) {}

  mensual(negocioId: string, anio?: number): Observable<GraficoMensualResponse> {
    let params = new HttpParams();
    if (anio) {
      params = params.set('anio', anio);
    }
    return this.http.get<GraficoMensualResponse>(`${this.apiUrl}/negocio/${negocioId}/mensual`, { params });
  }
}
