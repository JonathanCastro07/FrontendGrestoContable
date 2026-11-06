import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PagoPeriodicoService } from '../../services/PagoPeriodicoService';
import {
  PagoPeriodicoRequest,
  PagoPeriodicoResponse,
} from '../../models/pago-periodico';
import { NaturalezaMovimiento } from '../../models/tipo-movimiento';
import { TipoOrigen } from '../../models/origen';
import { NegocioResponse } from '../../models/negocio';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-pagos-periodicos',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './pagos-periodicos.html',
  styleUrl: './pagos-periodicos.scss',
})
export class PagosPeriodicos implements OnInit {

  pagos: PagoPeriodicoResponse[] = [];

  idNegocio: string = '';
  mostrarFormulario: boolean = false;
  error: string = '';
  exito: string = '';

  // nombre, monto y fecha del pago
  nuevoPago = {
    nombre: '',
    monto: 0,
    fecha: '',
  };

  // campos del Tipo de Movimiento (se crea embebido en el pago)
  nuevoTipoNombre: string = '';
  nuevaNaturaleza: string = '';

  // campos del Origen (se crea embebido en el pago)
  nuevoOrigenNombre: string = '';
  nuevoOrigenTipo: TipoOrigen | '' = '';

  constructor(
    private pagoPeriodicoService: PagoPeriodicoService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const negocio: NegocioResponse | null = this.auth.getNegocio();
    if (negocio) {
      this.idNegocio = negocio.idNegocio;
      this.cargarPagos();
    }
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
    if (!this.nuevoOrigenNombre || !this.nuevoOrigenTipo) {
      this.error = 'Completa el nombre y el tipo del origen';
      return;
    }

    // Un solo POST: el tipo y el origen viajan embebidos
    const pago: PagoPeriodicoRequest = {
      nombre: this.nuevoPago.nombre,
      monto: this.nuevoPago.monto,
      fecha: this.nuevoPago.fecha,
      negocioId: this.idNegocio,
      tipoMovimiento: {
        nombre: this.nuevoTipoNombre,
        naturaleza: this.nuevaNaturaleza as NaturalezaMovimiento
      },
      origen: {
        nombre: this.nuevoOrigenNombre,
        tipoOrigen: this.nuevoOrigenTipo
      }
    };

    this.pagoPeriodicoService.crear(pago).subscribe({
      next: () => {
        this.exito = 'Pago periódico registrado exitosamente';
        this.mostrarFormulario = false;
        this.resetFormulario();
        this.cargarPagos();
      },
      error: () => this.error = 'Error al registrar el pago periódico'
    });
  }

  private resetFormulario() {
    this.nuevoTipoNombre = '';
    this.nuevaNaturaleza = '';
    this.nuevoOrigenNombre = '';
    this.nuevoOrigenTipo = '';
    this.nuevoPago = {
      nombre: '',
      monto: 0,
      fecha: '',
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
}