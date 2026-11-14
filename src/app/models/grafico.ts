export interface MesGrafico {
  mes: number;
  etiqueta: string;
  ingresos: number;
  egresos: number;
  gastos: number;
  utilidad: number;
}

export interface TotalesGrafico {
  ingresos: number;
  egresos: number;
  gastos: number;
  utilidad: number;
}

export interface GraficoMensualResponse {
  negocioId: string;
  anio: number;
  aniosDisponibles: number[];
  meses: MesGrafico[];
  totales: TotalesGrafico;
}
