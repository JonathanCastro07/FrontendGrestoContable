import { Injectable } from '@angular/core';

const K_TOKEN = 'token';
const K_USUARIO = 'usuario';
const K_NEGOCIO = 'negocio';

@Injectable({ providedIn: 'root' })
export class AuthService {

  guardarSesion(login: { nombre: string; correo: string; token: string }): void {
    localStorage.setItem(K_TOKEN, login.token);
    localStorage.setItem(K_USUARIO, JSON.stringify({ nombre: login.nombre, correo: login.correo }));
  }

  guardarNegocio(negocio: any): void {
    localStorage.setItem(K_NEGOCIO, JSON.stringify(negocio));
  }

  getToken(): string | null {
    return localStorage.getItem(K_TOKEN);
  }

  getUsuario(): any | null {
    const data = localStorage.getItem(K_USUARIO);
    return data ? JSON.parse(data) : null;
  }

  getNegocio(): any | null {
    const data = localStorage.getItem(K_NEGOCIO);
    return data ? JSON.parse(data) : null;
  }

  // Lee la fecha de expiración (exp) que viene dentro del JWT
  tokenExpirado(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return !payload.exp || payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }

  estaAutenticado(): boolean {
    return !!this.getToken() && !this.tokenExpirado();
  }

  limpiarSesion(): void {
    localStorage.removeItem(K_TOKEN);
    localStorage.removeItem(K_USUARIO);
    localStorage.removeItem(K_NEGOCIO);
    localStorage.removeItem('yaVioExplicacion');
  }
}