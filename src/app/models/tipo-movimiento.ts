export type NaturalezaMovimiento = 'DEBITO' | 'CREDITO';

export interface TipoMovimientoRequest {
  nombre: string;
  naturaleza: NaturalezaMovimiento;
}

export interface TipoMovimientoResponse {
  // con I mayúscula: el backend lo devuelve así
  IdTipo: string;
  nombre: string;
  naturaleza: string;
}
