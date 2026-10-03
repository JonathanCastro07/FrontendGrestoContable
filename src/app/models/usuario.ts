export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  nombre: string;
  correo: string;
  token: string;
}

export interface RegistroRequest {
  nombre: string;
  correo: string;
  password: string;
  preguntaSeguridad: string;
}

export interface UsuarioResponse {
  idUsuario: string;
  nombre: string;
  correo: string;
}