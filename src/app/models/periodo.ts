// El periodo lo calcula el backend a partir de la fecha del movimiento
export interface PeriodoDto {
  id?: string;
  mes: string;
  anio: number;
}