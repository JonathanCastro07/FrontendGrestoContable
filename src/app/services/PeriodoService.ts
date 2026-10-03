import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Periodo } from '../models/periodo';

@Injectable({
  providedIn: 'root',
})
export class PeriodoService {

  private apiUrl = 'http://localhost:8080/api/periodo';

  constructor(private http: HttpClient) {}

  crear(periodo: Periodo): Observable<Periodo> {
    return this.http.post<Periodo>(this.apiUrl, periodo);
  }

  listarTodos(): Observable<Periodo[]> {
    return this.http.get<Periodo[]>(this.apiUrl);
  }

  actualizar(id: number, periodo: Periodo): Observable<Periodo> {
    return this.http.put<Periodo>(`${this.apiUrl}/${id}`, periodo);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}