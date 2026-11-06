import { OrigenDto } from './origen';
import { PeriodoDto } from './periodo';
import { TipoMovimientoDto } from './tipo-movimiento';

// OJO: el backend escribe "descricion" (sin la p) en el request y en el response
export interface MovimientoFinancieroRequest {
  monto: number;
  fecha: string;
  descricion: string;
  negocioId: string;
  tipoMovimiento: TipoMovimientoDto;
  origen: OrigenDto;
}

export interface MovimientoFinancieroResponse {
  idMovimiento: string;
  monto: number;
  fecha: string;
  descricion: string;
  negocioId: string;
  tipoMovimiento: TipoMovimientoDto;
  origen: OrigenDto;
  periodo: PeriodoDto;
}

export interface MovimientoResumenResponse {
  periodo: string;
  desde: string;
  hasta: string;
  totalIngresos: number;
  totalEgresos: number;
  totalGanancias: number;
}