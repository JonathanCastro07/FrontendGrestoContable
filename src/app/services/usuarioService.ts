import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api';
import {
  LoginRequest,
  LoginResponse,
  RegistroRequest,
  RegistroResponse,
} from '../models/usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = `${API_URL}/usuario`;

  constructor(private http: HttpClient) {}

  registrar(registro: RegistroRequest): Observable<RegistroResponse> {
    return this.http.post<RegistroResponse>(`${this.apiUrl}/registro`, registro);
  }

  // El token se guarda desde el componente con AuthService.guardarSesion()
  login(correo: string, password: string): Observable<LoginResponse> {
    const body: LoginRequest = { correo, password };
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, body);
  }

  // El interceptor agrega el token; el backend lo mete en la lista negra (Redis)
  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, null);
  }

  // Requieren CuentaController en el backend
  cambiarCorreo(nuevoCorreo: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/correo`, { nuevoCorreo });
  }

  cambiarPassword(passwordActual: string, nuevaPassword: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/password`, { passwordActual, nuevaPassword });
  }
}