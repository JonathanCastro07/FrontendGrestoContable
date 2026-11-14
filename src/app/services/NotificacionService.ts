import { Injectable, computed, signal } from '@angular/core';
import { AuthService } from './AuthService';
import { PagoPeriodicoService } from './PagoPeriodicoService';

export interface Aviso {
  id: string;
  titulo: string;
  detalle: string;
  dias: number; // 0 = hoy, 1 = mañana, ...
}

// Cuántos días antes del vencimiento se avisa
const DIAS_AVISO = 3;

const FMT_MONEDA = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  readonly avisos = signal<Aviso[]>([]);
  private readonly leidas = signal<Set<string>>(new Set());

  readonly sinLeer = computed(() => this.avisos().filter((a) => !this.leidas().has(a.id)).length);

  constructor(private pagos: PagoPeriodicoService, private auth: AuthService) {}

  refrescar() {
    const idNegocio = this.auth.getNegocio()?.idNegocio;
    if (!idNegocio) {
      this.avisos.set([]);
      return;
    }

    this.leidas.set(this.leerLeidas(idNegocio));

    this.pagos.listarActivos(idNegocio).subscribe({
      next: (lista) => {
        const hoy = new Date();
        const hoy0 = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

        const avisos: Aviso[] = [];
        for (const p of lista) {
          const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(p.fecha ?? '');
          if (!m) continue;
          const vence = new Date(+m[1], +m[2] - 1, +m[3]);
          const dias = Math.round((vence.getTime() - hoy0.getTime()) / 86400000);
          if (dias < 0 || dias > DIAS_AVISO) continue;

          const cuando = dias === 0 ? 'vence hoy' : dias === 1 ? 'vence mañana' : `vence en ${dias} días`;
          avisos.push({
            // el id incluye la fecha: si el pago cambia de fecha, vuelve a avisar
            id: `${p.id}|${m[0]}`,
            titulo: `Pago próximo: ${p.nombre}`,
            detalle: `${FMT_MONEDA.format(p.monto)} · ${cuando} (${m[3]}/${m[2]}/${m[1]})`,
            dias,
          });
        }
        avisos.sort((a, b) => a.dias - b.dias);
        this.avisos.set(avisos);
      },
      error: () => {
        /* si falla, se conservan los avisos anteriores */
      },
    });
  }

  marcarLeidas() {
    const idNegocio = this.auth.getNegocio()?.idNegocio;
    if (!idNegocio) return;
    const todas = new Set<string>([...this.leidas(), ...this.avisos().map((a) => a.id)]);
    this.leidas.set(todas);
    try {
      localStorage.setItem(`notif_leidas_${idNegocio}`, JSON.stringify([...todas]));
    } catch {
      /* sin almacenamiento: solo se pierde recordar lo leído */
    }
  }

  esLeida(id: string): boolean {
    return this.leidas().has(id);
  }

  private leerLeidas(idNegocio: string): Set<string> {
    try {
      const raw = localStorage.getItem(`notif_leidas_${idNegocio}`);
      return new Set<string>(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set<string>();
    }
  }
}