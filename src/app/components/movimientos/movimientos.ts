import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovimientoService } from '../../services/MovimientoService';
import { NegocioService } from '../../services/NegocioService';
import {
  MovimientoFinancieroRequest,
  MovimientoFinancieroResponse,
} from '../../models/movimiento';
import { NegocioResponse } from '../../models/negocio';
import { TipoOrigen } from '../../models/origen';
import { NaturalezaMovimiento } from '../../models/tipo-movimiento';

@Component({
  selector: 'app-movimientos',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.scss',
})
export class Movimientos implements OnInit {

  movimientos: MovimientoFinancieroResponse[] = [];
  negocios: NegocioResponse[] = [];

  // monto, fecha y descripción del movimiento
  nuevoMovimiento = {
    monto: 0,
    fecha: '',
    descricion: '',
  };

  // campos del Tipo de Movimiento (se crea embebido en el movimiento)
  tipoNombre: string = '';
  naturaleza: string = '';

  // campos del Origen (se crea embebido en el movimiento)
  origenNombre: string = '';
  origenTipo: TipoOrigen | '' = '';

  idNegocioSeleccionado: string = '';
  error: string = '';
  exito: string = '';
  mostrarFormulario: boolean = false;

  constructor(
    private movimientoService: MovimientoService,
    private negocioService: NegocioService
  ) {}

  ngOnInit() {
    this.cargarNegocioYMovimientos();
  }

  cargarNegocioYMovimientos() {
    this.negocioService.misNegocios().subscribe({
      next: (data) => {
        this.negocios = data;
        if (data.length > 0) {
          this.idNegocioSeleccionado = data[0].idNegocio;
          this.cargarMovimientos();
        }
      },
      error: () => this.error = 'Error al cargar el negocio'
    });
  }

  cargarMovimientos() {
    if (!this.idNegocioSeleccionado) return;
    this.movimientoService.listarPorNegocio(this.idNegocioSeleccionado).subscribe({
      next: (data) => this.movimientos = data,
      error: () => this.error = 'Error al cargar movimientos'
    });
  }

  onTipoChange() {
    this.naturaleza = '';
    this.origenNombre = '';
    this.origenTipo = '';
  }

  private soloFecha(fecha: string): string {
    return fecha.split('T')[0];
  }

  registrar() {
    this.error = '';
    this.exito = '';

    if (!this.idNegocioSeleccionado) {
      this.error = 'No hay un negocio seleccionado';
      return;
    }
    if (!this.nuevoMovimiento.fecha) {
      this.error = 'Selecciona la fecha del movimiento';
      return;
    }
    if (!this.tipoNombre) {
      this.error = 'Selecciona un tipo de movimiento';
      return;
    }
    if (!this.naturaleza) {
      this.error = 'Selecciona la naturaleza del movimiento';
      return;
    }
    if (!this.origenNombre) {
      this.error = 'Ingresa el nombre del origen';
      return;
    }
    if (!this.origenTipo) {
      this.error = 'Selecciona el tipo de origen';
      return;
    }

    // Un solo POST: el tipo y el origen viajan embebidos y el backend calcula el periodo
    const movimiento: MovimientoFinancieroRequest = {
      monto: this.nuevoMovimiento.monto,
      fecha: this.soloFecha(this.nuevoMovimiento.fecha),
      descricion: this.nuevoMovimiento.descricion,
      negocioId: this.idNegocioSeleccionado,
      tipoMovimiento: {
        nombre: this.tipoNombre,
        naturaleza: this.naturaleza as NaturalezaMovimiento
      },
      origen: {
        nombre: this.origenNombre,
        tipoOrigen: this.origenTipo
      }
    };

    this.movimientoService.registrarMovimiento(movimiento).subscribe({
      next: () => {
        this.exito = 'Movimiento registrado exitosamente';
        this.mostrarFormulario = false;
        this.resetFormulario();
        this.cargarMovimientos();
      },
      error: () => this.error = 'Error al registrar el movimiento'
    });
  }

  private resetFormulario() {
    this.tipoNombre = '';
    this.naturaleza = '';
    this.origenNombre = '';
    this.origenTipo = '';
    this.nuevoMovimiento = {
      monto: 0,
      fecha: '',
      descricion: '',
    };
  }

  eliminar(id: string | undefined) {
    if (!id) return;
    this.movimientoService.eliminarMovimiento(id).subscribe({
      next: () => this.cargarMovimientos(),
      error: () => this.error = 'Error al eliminar el movimiento'
    });
  }
}