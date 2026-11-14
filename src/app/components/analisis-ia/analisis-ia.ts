import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AnalisisIAService } from '../../services/AnalisisIAService';
import { NegocioService } from '../../services/NegocioService';
import { AnalisisIAResponse, PeriodoAnalisis } from '../../models/analisis-ia';
import { NegocioResponse } from '../../models/negocio';

@Component({
  selector: 'app-analisis-ia',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './analisis-ia.html',
  styleUrl: './analisis-ia.scss',
})
export class AnalisisIa implements OnInit {
  negocios: NegocioResponse[] = [];
  idNegocio = '';
  periodo: PeriodoAnalisis = 'mensual';

  ultimo: AnalisisIAResponse | null = null;
  historial: AnalisisIAResponse[] = [];

  generando = false;
  cargando = false;
  error = '';

  constructor(
    private analisisService: AnalisisIAService,
    private negocioService: NegocioService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.negocioService.misNegocios().subscribe({
      next: (data) => {
        this.negocios = data;
        if (data.length > 0) {
          this.idNegocio = data[0].idNegocio;
          this.cargarHistorial();
        }
        this.cd.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar tus negocios';
        this.cd.detectChanges();
      },
    });
  }

  cambiarNegocio() {
    this.ultimo = null;
    this.cargarHistorial();
  }

  cargarHistorial() {
    if (!this.idNegocio) return;
    this.cargando = true;
    this.error = '';
    this.analisisService.listar(this.idNegocio).subscribe({
      next: (lista) => {
        this.historial = [...lista].sort(
          (a, b) => new Date(b.fechaGeneracion).getTime() - new Date(a.fechaGeneracion).getTime()
        );
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar el historial de análisis';
        this.cargando = false;
        this.cd.detectChanges();
      },
    });
  }

  generar() {
    if (!this.idNegocio || this.generando) return;
    this.generando = true;
    this.error = '';
    this.analisisService.generar(this.idNegocio, this.periodo).subscribe({
      next: (a) => {
        this.ultimo = a;
        this.generando = false;
        this.cargarHistorial();
        this.cd.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo generar el análisis. Intenta de nuevo en unos segundos.';
        this.generando = false;
        this.cd.detectChanges();
      },
    });
  }

  etiquetaPeriodo(a: AnalisisIAResponse): string {
    const p = a.periodo;
    if (!p) return '';
    return typeof p === 'string' ? p : `${p.mes} ${p.anio}`;
  }

  // Texto + icono: el color nunca es lo unico que dice el estado
  alerta(tipo: string): { icono: string; texto: string; clase: string } {
    const t = (tipo || '').toUpperCase();
    if (t.includes('GASTO') || t.includes('ELEVADO') || t.includes('CRIT')) {
      return { icono: '⚠', texto: 'Gasto elevado', clase: 'alerta' };
    }
    if (t.includes('POSITIV')) {
      return { icono: '✔', texto: 'Tendencia positiva', clase: 'positiva' };
    }
    return { icono: 'ℹ', texto: tipo || 'Informativo', clase: 'info' };
  }
}
