import { Injectable, signal } from '@angular/core';

export type TipoToast = 'exito' | 'error';

export interface Toast {
  id: number;
  tipo: TipoToast;
  mensaje: string;
}

// Avisos flotantes globales. Usa signals, así que se pintan solos (la app es zoneless).
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private siguienteId = 1;

  exito(mensaje: string) {
    this.mostrar('exito', mensaje);
  }

  error(mensaje: string) {
    this.mostrar('error', mensaje, 6000);
  }

  cerrar(id: number) {
    this.toasts.update((lista) => lista.filter((t) => t.id !== id));
  }

  private mostrar(tipo: TipoToast, mensaje: string, duracionMs = 4000) {
    const id = this.siguienteId++;
    this.toasts.update((lista) => [...lista, { id, tipo, mensaje }]);
    setTimeout(() => this.cerrar(id), duracionMs);
  }
}
