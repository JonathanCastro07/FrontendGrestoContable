// El backend puede mandar el periodo como texto ("mensual") o como objeto {mes, anio}
export interface AnalisisIAResponse {
  id: string;
  negocioId?: string;
  negocioid?: string;
  periodo: string | { mes: string; anio: number } | null;
  textoGenerado: string;
  tipoAlerta: string;
  fechaGeneracion: string;
}

export type PeriodoAnalisis = 'semanal' | 'quincenal' | 'mensual';
