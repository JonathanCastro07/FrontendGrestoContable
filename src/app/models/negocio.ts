import { Usuario } from "./usuario";

export interface Negocio {
idNegocio?: number;
nombreNegocio: string;
tipoActividad: string;  
capitalInicial: number;
rolPropietario? : string;
usuario?: Usuario;
}
