import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { API_URL } from '../config/api';
import {
  LoginRequest,
  LoginResponse,
  RegistroRequest,
  UsuarioResponse,
} from '../models/usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = `${API_URL}/usuario`;

  constructor(private http: HttpClient) {}

  registrar(registro: RegistroRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.apiUrl}/registro`, registro);
  }

  login(correo: string, password: string): Observable<LoginResponse> {
    const body: LoginRequest = { correo, password };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, body).pipe(
      tap((res) => localStorage.setItem('token', res.token))
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, null).pipe(
      finalize(() => localStorage.removeItem('token'))
    );
  }

  listar(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(this.apiUrl);
  }

  buscarPorId(id: string): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.apiUrl}/${id}`);
  }

  actualizar(id: string, registro: RegistroRequest): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.apiUrl}/${id}`, registro);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}