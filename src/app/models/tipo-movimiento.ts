export type NaturalezaMovimiento = 'DEBITO' | 'CREDITO';

// El tipo de movimiento va embebido dentro del movimiento o del pago periódico
export interface TipoMovimientoDto {
  id?: string;
  nombre: string;
  naturaleza: NaturalezaMovimiento;
}