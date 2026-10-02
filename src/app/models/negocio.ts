export interface NegocioRequest {
  nombreNegocio: string;
  // con T mayúscula: así lo llama el backend
  TipoActividad: string;
  capitalInicial: number;
}

export interface NegocioResponse {
  idNegocio: string;
  // aquí es "nombre", no "nombreNegocio"
  nombre: string;
  tipoActividad: string;
  capitalInicial: number;
}

// devuelve GET /api/negocio/{id}/financiero
// ojo: "totalIngreso" va en singular, los otros dos en plural
export interface ResumenFinanciero {
  totalIngreso: number;
  totalEgresos: number;
  totalGastos: number;
  utilidad: number;
}
