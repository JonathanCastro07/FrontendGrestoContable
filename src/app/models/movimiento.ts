import { Negocio } from "./negocio";
import { TipoMovimiento } from "./tipo-movimiento";
import { Origen } from "./origen";

export interface Movimiento { 
idMovimiento?: number;
monto: number;
fecha: string;
descripcion?: string;
negocio?: Negocio;
tipoMovimiento?: TipoMovimiento;
origen?: Origen;


}
