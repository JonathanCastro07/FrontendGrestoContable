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
import {
  NaturalezaMovimiento,
  TipoMovimientoRequest,
  TipoMovimientoResponse,
} from '../../models/tipo-movimiento';
import { OrigenRequest, OrigenResponse, TipoOrigen } from '../../models/origen';
import { NegocioResponse } from '../../models/negocio';

@Component({
  selector: 'app-pagos-periodicos',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './pagos-periodicos.html',
  styleUrl: './pagos-periodicos.scss',
})
export class PagosPeriodicos implements OnInit {

  pagos: PagoPeriodicoResponse[] = [];

  // se guardan solo para poder mostrar el nombre en la tabla de abajo
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

  // campos para crear el Tipo de Movimiento nuevo
  nuevoTipoNombre: string = '';
  nuevaNaturaleza: string = '';

  // campos para crear el Origen nuevo
  nuevoOrigenDescripcion: string = '';
  nuevoOrigenTipo: TipoOrigen | '' = '';

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
    // solo para poder mostrar nombres en la tabla, no para elegir
    this.tipoMovimientoService.listarTodo().subscribe({
      next: (data) => this.tiposMovimiento = data
    });
    this.origenService.listar().subscribe({
      next: (data) => this.origenes = data
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
    this.error = '';
    this.exito = '';

    if (!this.nuevoPago.nombre || !this.nuevoPago.monto || !this.nuevoPago.fecha) {
      this.error = 'Completa nombre, monto y fecha';
      return;
    }
    if (!this.nuevoTipoNombre || !this.nuevaNaturaleza) {
      this.error = 'Completa el nombre y la naturaleza del tipo de movimiento';
      return;
    }
    if (!this.nuevoOrigenDescripcion || !this.nuevoOrigenTipo) {
      this.error = 'Completa la descripción y el tipo del origen';
      return;
    }

    const tipo: TipoMovimientoRequest = {
      nombre: this.nuevoTipoNombre,
      naturaleza: this.nuevaNaturaleza as NaturalezaMovimiento
    };

    this.tipoMovimientoService.crear(tipo).subscribe({
      next: (tipoGuardado) => {
        this.tiposMovimiento.push(tipoGuardado);

        const origen: OrigenRequest = {
          descripcion: this.nuevoOrigenDescripcion,
          tipoOrigen: this.nuevoOrigenTipo as TipoOrigen
        };

        this.origenService.crear(origen).subscribe({
          next: (origenGuardado) => {
            this.origenes.push(origenGuardado);

            this.nuevoPago.negocioId = this.idNegocio;
            this.nuevoPago.tipoMovimientoId = tipoGuardado.IdTipo;
            this.nuevoPago.origenId = origenGuardado.id;

            this.pagoPeriodicoService.crear(this.nuevoPago).subscribe({
              next: () => {
                this.exito = 'Pago periódico registrado exitosamente';
                this.mostrarFormulario = false;
                this.resetFormulario();
                this.cargarPagos();
              },
              error: () => this.error = 'Error al registrar el pago periódico'
            });
          },
          error: () => this.error = 'Error al guardar el origen'
        });
      },
      error: () => this.error = 'Error al guardar el tipo'
    });
  }

  private resetFormulario() {
    this.nuevoTipoNombre = '';
    this.nuevaNaturaleza = '';
    this.nuevoOrigenDescripcion = '';
    this.nuevoOrigenTipo = '';
    this.nuevoPago = {
      nombre: '',
      monto: 0,
      fecha: '',
      negocioId: '',
      tipoMovimientoId: '',
      origenId: '',
    };
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