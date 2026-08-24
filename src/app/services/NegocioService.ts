import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Negocio } from '../models/negocio';

@Injectable({
  providedIn: 'root',
})
export class NegocioService {
private apiUrl = 'http://localhost:8080/api/negocio';

constructor(private http: HttpClient){}

crear(crear: Negocio): Observable<Negocio>{
  return this.http.post<Negocio>(`${this.apiUrl}/crear`, crear);
}

listarPorUsuario(idUsuario: number): Observable<Negocio[]> {
  return this.http.get<Negocio[]>(`${this.apiUrl}/usuario/${idUsuario}`);
}

actualizar(id: number, negocio: Negocio): Observable<Negocio>{
  return this.http.put<Negocio>(`${this.apiUrl}/${id}`, negocio);
}

eliminar(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
}

calcularUtilidad(id: number): Observable<number>{
  return this.http.get<number>(`${this.apiUrl}/${id}`);
}
verResumenFinanciero(id: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/${id}/financiero`);
}
}
