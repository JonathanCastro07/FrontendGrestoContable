export type TipoOrigen =
  | 'PROVEEDOR'
  | 'TRABAJADOR'
  | 'SERVICIO_PUBLICO'
  | 'FACTURA'
  | 'CLIENTE'
  | 'OTRO';

export interface OrigenRequest {
  descripcion: string;
  tipoOrigen: TipoOrigen;
}

export interface OrigenResponse {
  // el id se llama "id", no "idOrigen"
  id: string;
  descripcion: string;
  tipoOrigen: TipoOrigen;
}
