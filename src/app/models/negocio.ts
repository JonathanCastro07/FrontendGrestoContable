export interface NegocioRequest {
  nombreNegocio: string;
  TipoActividad: string;
  capitalInicial: number;
}

export interface NegocioResponse {
  idNegocio: string;
  nombre: string;
  tipoActividad: string;
  capitalInicial: number;
}

export interface ResumenFinanciero {
  totalIngreso: number;
  totalEgresos: number;
  totalGastos: number;
  utilidad: number;
}