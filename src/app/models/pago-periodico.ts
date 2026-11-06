import { OrigenDto } from './origen';
import { TipoMovimientoDto } from './tipo-movimiento';

export interface PagoPeriodicoRequest {
  nombre: string;
  monto: number;
  fecha: string;
  descripcion?: string;
  negocioId: string;
  tipoMovimiento: TipoMovimientoDto;
  origen: OrigenDto;
}

export interface PagoPeriodicoResponse {
  id: string;
  nombre: string;
  monto: number;
  fecha: string;
  activo: boolean;
  descripcion?: string;
  negocioId: string;
  tipoMovimiento: TipoMovimientoDto;
  origen: OrigenDto;
}