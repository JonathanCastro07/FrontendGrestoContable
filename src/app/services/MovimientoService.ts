import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Movimiento } from '../models/movimiento';

@Injectable({
  providedIn: 'root',
})
export class MovimientoService {

  private apiUrl = 'http://localhost:8080/api/movimiento';

  constructor(private http: HttpClient) {}

  registrar(movimiento: Movimiento): Observable<Movimiento> {
    return this.http.post<Movimiento>(`${this.apiUrl}/registro`, movimiento);
  }

  editar(id: number, movimiento: Movimiento): Observable<Movimiento> {
    return this.http.put<Movimiento>(`${this.apiUrl}/${id}`, movimiento);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarPorNegocio(idNegocio: number): Observable<Movimiento[]> {
  return this.http.get<Movimiento[]>(`${this.apiUrl}/negocio/${idNegocio}`);
}

  listarPorFecha(idNegocio: number, desde: string, hasta: string): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(
      `${this.apiUrl}/negocio/${idNegocio}/fechas?desde=${desde}&hasta=${hasta}`
    );
  }
}