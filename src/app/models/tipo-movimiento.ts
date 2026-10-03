export type NaturalezaMovimiento = 'DEBITO' | 'CREDITO';

export interface TipoMovimientoRequest {
  nombre: string;
  naturaleza: NaturalezaMovimiento;
}

export interface TipoMovimientoResponse {
  IdTipo: string;
  nombre: string;
  naturaleza: string;
}