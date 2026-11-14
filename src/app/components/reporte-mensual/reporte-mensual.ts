import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MovimientoService } from '../../services/MovimientoService';
import { NegocioService } from '../../services/NegocioService';
import { MovimientoFinancieroResponse } from '../../models/movimiento';
import { NegocioResponse } from '../../models/negocio';
import { MESES, filtrarMes, generarReportePdf, moneda, nombreArchivo, totales } from '../../services/ReportePdf';

@Component({
  selector: 'app-reporte-mensual',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reporte-mensual.html',
  styleUrl: './reporte-mensual.scss',
})
export class ReporteMensual implements OnInit {
  readonly meses = MESES;
  anios: number[] = [];

  negocios: NegocioResponse[] = [];
  idNegocio = '';
  mes = new Date().getMonth() + 1;
  anio = new Date().getFullYear();

  todos: MovimientoFinancieroResponse[] = [];
  delMes: MovimientoFinancieroResponse[] = [];
  resumen = { ingresos: 0, egresos: 0, gastos: 0, utilidad: 0 };

  cargando = false;
  error = '';
  moneda = moneda;

  constructor(
    private movimientoService: MovimientoService,
    private negocioService: NegocioService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.negocioService.misNegocios().subscribe({
      next: (data) => {
        this.negocios = data;
        if (data.length > 0) {
          this.idNegocio = data[0].idNegocio;
          this.cargar();
        }
        this.cd.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar tus negocios';
        this.cd.detectChanges();
      },
    });
  }

  get nombreNegocio(): string {
    return this.negocios.find((n) => n.idNegocio === this.idNegocio)?.nombre ?? '';
  }

  cargar() {
    if (!this.idNegocio) return;
    this.cargando = true;
    this.error = '';
    this.movimientoService.listarPorNegocio(this.idNegocio).subscribe({
      next: (movs) => {
        this.todos = movs;
        const set = new Set<number>(movs.map((m) => new Date(m.fecha).getFullYear()));
        set.add(this.anio);
        this.anios = [...set].sort();
        this.aplicar();
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar los movimientos';
        this.cargando = false;
        this.cd.detectChanges();
      },
    });
  }

  aplicar() {
    this.delMes = filtrarMes(this.todos, this.mes, this.anio);
    this.resumen = totales(this.delMes);
  }

  descargarPdf() {
    const doc = generarReportePdf({
      negocio: this.nombreNegocio,
      mes: this.mes,
      anio: this.anio,
      movimientos: this.delMes,
    });
    doc.save(nombreArchivo(this.nombreNegocio, this.mes, this.anio));
  }
}
