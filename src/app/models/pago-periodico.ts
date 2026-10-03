export interface PagoPeriodicoRequest {
  nombre: string;
  monto: number;
  fecha: string;
  negocioId: string;
  tipoMovimientoId: string;
  origenId: string;
}

export interface PagoPeriodicoResponse {
  id: string;
  nombre: string;
  monto: number;
  fecha: string;
  activo: boolean;
  negocioId: string;
  tipoMovimientoId: string;
  origenId: string;
}