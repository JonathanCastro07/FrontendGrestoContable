import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PagoPeriodicoService } from '../../services/PagoPeriodicoService';
import { TipoMovimientoService } from '../../services/Tipo-movimientoService';
import { OrigenService } from '../../services/OrigenService';
import {
  PagoPeriodicoRequest,
  PagoPeriodicoResponse,
} from '../../models/pago-periodico';
import { TipoMovimientoResponse } from '../../models/tipo-movimiento';
import { OrigenResponse } from '../../models/origen';
import { NegocioResponse } from '../../models/negocio';

@Component({
  selector: 'app-pagos-periodicos',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './pagos-periodicos.html',
  styleUrl: './pagos-periodicos.scss',
})
export class PagosPeriodicos implements OnInit {

  pagos: PagoPeriodicoResponse[] = [];
  tiposMovimiento: TipoMovimientoResponse[] = [];
  origenes: OrigenResponse[] = [];

  idNegocio: string = '';
  mostrarFormulario: boolean = false;
  error: string = '';
  exito: string = '';

  nuevoPago: PagoPeriodicoRequest = {
    nombre: '',
    monto: 0,
    fecha: '',
    negocioId: '',
    tipoMovimientoId: '',
    origenId: '',
  };

  constructor(
    private pagoPeriodicoService: PagoPeriodicoService,
    private tipoMovimientoService: TipoMovimientoService,
    private origenService: OrigenService
  ) {}

  ngOnInit() {
    const dataNegocio = localStorage.getItem('negocio');
    if (dataNegocio) {
      const negocio: NegocioResponse = JSON.parse(dataNegocio);
      this.idNegocio = negocio.idNegocio;
      this.cargarPagos();
    }
    this.cargarCatalogos();
  }

  // trae los tipos de movimiento y orígenes YA creados, para elegir
  // de una lista en vez de crear uno nuevo cada vez
  cargarCatalogos() {
    this.tipoMovimientoService.listarTodo().subscribe({
      next: (data) => this.tiposMovimiento = data,
      error: () => this.error = 'Error al cargar los tipos de movimiento'
    });

    this.origenService.listar().subscribe({
      next: (data) => this.origenes = data,
      error: () => this.error = 'Error al cargar los orígenes'
    });
  }

  cargarPagos() {
    if (!this.idNegocio) return;
    this.pagoPeriodicoService.listarPorNegocio(this.idNegocio).subscribe({
      next: (data) => this.pagos = data,
      error: () => this.error = 'Error al cargar los pagos periódicos'
    });
  }

  registrar() {
    if (!this.nuevoPago.nombre || !this.nuevoPago.monto || !this.nuevoPago.fecha) {
      this.error = 'Completa nombre, monto y fecha';
      return;
    }
    if (!this.nuevoPago.tipoMovimientoId) {
      this.error = 'Selecciona un tipo de movimiento';
      return;
    }
    if (!this.nuevoPago.origenId) {
      this.error = 'Selecciona un origen';
      return;
    }

    this.nuevoPago.negocioId = this.idNegocio;

    this.pagoPeriodicoService.crear(this.nuevoPago).subscribe({
      next: () => {
        this.exito = 'Pago periódico registrado exitosamente';
        this.mostrarFormulario = false;
        this.nuevoPago = {
          nombre: '',
          monto: 0,
          fecha: '',
          negocioId: '',
          tipoMovimientoId: '',
          origenId: '',
        };
        this.cargarPagos();
      },
      error: () => this.error = 'Error al registrar el pago periódico'
    });
  }

  ejecutar(id: string) {
    this.pagoPeriodicoService.ejecutar(id).subscribe({
      next: () => {
        this.exito = 'Pago ejecutado: se generó el movimiento';
        this.cargarPagos();
      },
      error: () => this.error = 'Error al ejecutar el pago'
    });
  }

  eliminar(id: string) {
    this.pagoPeriodicoService.eliminar(id).subscribe({
      next: () => this.cargarPagos(),
      error: () => this.error = 'Error al eliminar el pago periódico'
    });
  }

  nombreTipo(id: string): string {
    return this.tiposMovimiento.find(t => t.IdTipo === id)?.nombre ?? '—';
  }

  nombreOrigen(id: string): string {
    return this.origenes.find(o => o.id === id)?.descripcion ?? '—';
  }
}