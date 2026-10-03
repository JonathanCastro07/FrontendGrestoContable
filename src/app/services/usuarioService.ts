import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8080/api/usuario';

  constructor(private http: HttpClient){}

  registrar(usuario: Usuario): Observable<Usuario>{
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, usuario);
  }
  login(correo: string, password: string): Observable<Usuario>{
    return this.http.post<Usuario>(`${this.apiUrl}/login`,{correo, password});
  }
  listar(): Observable<Usuario[]>{
    return this.http.get<Usuario[]>(this.apiUrl);
  }
  buscarPorId(id: number): Observable<Usuario>{
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }
  actualizar(id: number, usuario: Usuario): Observable<Usuario>{
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
}
  eliminar(id: number):Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}