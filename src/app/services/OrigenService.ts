import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api';
import { OrigenRequest, OrigenResponse } from '../models/origen';

@Injectable({
  providedIn: 'root',
})
export class OrigenService {
  private apiUrl = `${API_URL}/origen`;

  constructor(private http: HttpClient) {}

  crear(origen: OrigenRequest): Observable<OrigenResponse> {
    return this.http.post<OrigenResponse>(this.apiUrl, origen);
  }

  listarTodos(): Observable<OrigenResponse[]> {
    return this.http.get<OrigenResponse[]>(this.apiUrl);
  }

  buscarPorId(id: string): Observable<OrigenResponse> {
    return this.http.get<OrigenResponse>(`${this.apiUrl}/${id}`);
  }

  actualizar(id: string, origen: OrigenRequest): Observable<OrigenResponse> {
    return this.http.put<OrigenResponse>(`${this.apiUrl}/${id}`, origen);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
