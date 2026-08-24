import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoMovimiento } from '../models/tipo-movimiento';

@Injectable({
  providedIn: 'root',
})
export class TipoMovimientoService {

  private apiUrl = 'http://localhost:8080/api/tipo-movimiento';

  constructor(private http: HttpClient) {}

  crear(tipo: TipoMovimiento): Observable<TipoMovimiento> {
    return this.http.post<TipoMovimiento>(this.apiUrl, tipo);
  }

  listarTodos(): Observable<TipoMovimiento[]> {
    return this.http.get<TipoMovimiento[]>(this.apiUrl);
  }

  actualizar(id: number, tipo: TipoMovimiento): Observable<TipoMovimiento> {
    return this.http.put<TipoMovimiento>(`${this.apiUrl}/${id}`, tipo);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
