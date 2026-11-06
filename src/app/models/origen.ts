export type TipoOrigen =
  | 'PROVEEDOR'
  | 'TRABAJADOR'
  | 'SERVICIO_PUBLICO'
  | 'FACTURA'
  | 'CLIENTE'
  | 'OTRO';

// El origen va embebido dentro del movimiento o del pago periódico
export interface OrigenDto {
  id?: string;
  nombre: string;
  tipoOrigen: TipoOrigen;
}