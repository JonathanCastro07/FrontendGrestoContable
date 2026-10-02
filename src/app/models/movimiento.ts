export interface MovimientoFinancieroRequest {
  monto: number;
  fecha: string;
  // con c: el backend escribe "descricion"
  descricion: string;
  negocioId: string;
  tipoId: string;
  origenId: string;
  periodoId: string;
}

export interface MovimientoFinancieroResponse {
  idMovimiento: string;
  monto: number;
  fecha: string;
  descricion: string;
  negocioId: string;
  tipoId: string;
  origenId: string;
  periodoId: string;
}

export interface MovimientoResumenResponse {
  periodo: string;
  desde: string;
  hasta: string;
  totalIngresos: number;
  totalEgresos: number;
  totalGanancias: number;
}
