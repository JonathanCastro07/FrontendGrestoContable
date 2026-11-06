export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  nombre: string;
  correo: string;
  token: string;
}

// Un solo formulario: datos del usuario + su primer negocio
export interface RegistroRequest {
  nombre: string;
  correo: string;
  password: string;
  telefono: string;
  preguntaSeguridad: string;
  respuestaSeguridad: string;
  nombreNegocio: string;
  tipoActividad: string;
  capitalInicial: number;
  rolPropietario: string;
}

export interface RegistroResponse {
  idNegocio: string;
  nombre: string;
  correo: string;
  nombreNegocio: string;
}

// Lo que se guarda en el navegador del usuario que inició sesión
export interface UsuarioSesion {
  nombre: string;
  correo: string;
}