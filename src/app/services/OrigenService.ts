import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Origen } from '../models/origen';

@Injectable({
  providedIn: 'root',
})
export class OrigenService {

  private apiUrl = 'http://localhost:8080/api/origen';

  constructor(private http: HttpClient) {}

  crear(origen: Origen): Observable<Origen> {
    return this.http.post<Origen>(this.apiUrl, origen);
  }

  listarTodos(): Observable<Origen[]> {
    return this.http.get<Origen[]>(this.apiUrl);
  }

  actualizar(id: number, origen: Origen): Observable<Origen> {
    return this.http.put<Origen>(`${this.apiUrl}/${id}`, origen);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}