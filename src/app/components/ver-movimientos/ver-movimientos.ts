import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovimientoService } from '../../services/MovimientoService';
import { NegocioService } from '../../services/NegocioService';
import { PagoPeriodicoService } from '../../services/PagoPeriodicoService';
import { MovimientoFinancieroRequest, MovimientoFinancieroResponse } from '../../models/movimiento';
import { NegocioResponse } from '../../models/negocio';
import { NaturalezaMovimiento } from '../../models/tipo-movimiento';
import { TipoOrigen } from '../../models/origen';
import { PagoPeriodicoResponse } from '../../models/pago-periodico';

@Component({
  selector: 'app-ver-movimientos',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './ver-movimientos.html',
  styleUrl: './ver-movimientos.scss',
})
export class VerMovimientos implements OnInit {

  movimientos: MovimientoFinancieroResponse[] = [];
  negocios: NegocioResponse[] = [];
  pagosPeriodicos: PagoPeriodicoResponse[] = [];

  movimientoEditando: MovimientoFinancieroRequest | null = null;
  idMovimientoEditando: string = '';
  movimientosFiltrados: MovimientoFinancieroResponse[] = [];

  busqueda: string = '';
  mostrarEditar: boolean = false;

  // Tipo y Origen del movimiento que se está editando (se crean embebidos al guardar)
  tipoNombreEditar: string = '';
  naturalezaEditar: string = '';
  origenNombreEditar: string = '';
  origenTipoEditar: TipoOrigen | '' = '';

  idNegocioSeleccionado: string = '';
  error: string = '';
  exito: string = '';

  constructor(
    private movimientoService: MovimientoService,
    private negocioService: NegocioService,
    private pagoPeriodicoService: PagoPeriodicoService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarNegocioYMovimientos();
  }

  cargarNegocioYMovimientos() {
    this.negocioService.misNegocios().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.negocios = data;
          this.idNegocioSeleccionado = data[0].idNegocio;
          this.cargarMovimientos();
          this.cargarPagosPeriodicos();
        }
      },
      error: () => this.error = 'Error al cargar el negocio'
    });
  }

  cargarMovimientos() {
    if (!this.idNegocioSeleccionado) return;
    this.movimientoService.listarPorNegocio(this.idNegocioSeleccionado).subscribe({
      next: (data) => {
        this.movimientos = [...data];
        this.buscar();
        this.cd.detectChanges();
      },
      error: () => this.error = 'Error al cargar movimientos'
    });
  }

  cargarPagosPeriodicos() {
    if (!this.idNegocioSeleccionado) return;
    this.pagoPeriodicoService.listarPorNegocio(this.idNegocioSeleccionado).subscribe({
      next: (data) => {
        this.pagosPeriodicos = [...data];
        this.cd.detectChanges();
      },
      error: () => this.error = 'Error al cargar pagos periódicos'
    });
  }

  editarMovimiento(movimiento: MovimientoFinancieroResponse) {
    this.movimientoEditando = {
      monto: movimiento.monto,
      fecha: movimiento.fecha,
      descricion: movimiento.descricion,
      negocioId: movimiento.negocioId,
      tipoMovimiento: movimiento.tipoMovimiento,
      origen: movimiento.origen
    };
    this.idMovimientoEditando = movimiento.idMovimiento;

    // Se precargan los valores actuales del movimiento
    this.tipoNombreEditar = movimiento.tipoMovimiento.nombre;
    this.naturalezaEditar = movimiento.tipoMovimiento.naturaleza;
    this.origenNombreEditar = movimiento.origen.nombre;
    this.origenTipoEditar = movimiento.origen.tipoOrigen;

    this.error = '';
    this.exito = '';
    this.mostrarEditar = true;
  }

  guardarEdicion() {
    if (!this.movimientoEditando) return;

    if (!this.tipoNombreEditar || !this.naturalezaEditar) {
      this.error = 'Completa el tipo de movimiento y la naturaleza';
      return;
    }
    if (!this.origenNombreEditar || !this.origenTipoEditar) {
      this.error = 'Completa el nombre y el tipo del origen';
      return;
    }

    this.error = '';

    // Un solo PUT: tipo y origen van embebidos (el backend solo necesita la fecha, sin hora)
    const cambios: MovimientoFinancieroRequest = {
      ...this.movimientoEditando,
      fecha: this.movimientoEditando.fecha.split('T')[0],
      tipoMovimiento: {
        nombre: this.tipoNombreEditar,
        naturaleza: this.naturalezaEditar as NaturalezaMovimiento
      },
      origen: {
        nombre: this.origenNombreEditar,
        tipoOrigen: this.origenTipoEditar
      }
    };

    this.movimientoService.editarMovimiento(this.idMovimientoEditando, cambios).subscribe({
      next: () => {
        this.exito = 'Movimiento actualizado exitosamente';
        this.cancelarEdicion();
        this.cargarMovimientos();
      },
      error: () => this.error = 'Error al editar el movimiento'
    });
  }

  cancelarEdicion() {
    this.mostrarEditar = false;
    this.movimientoEditando = null;
    this.idMovimientoEditando = '';
    this.tipoNombreEditar = '';
    this.naturalezaEditar = '';
    this.origenNombreEditar = '';
    this.origenTipoEditar = '';
  }

  buscar() {
    const texto = this.busqueda.trim().toLowerCase();
    if (!texto) {
      this.movimientosFiltrados = [...this.movimientos];
      return;
    }
    this.movimientosFiltrados = this.movimientos.filter(m =>
      m.descricion?.toLowerCase().includes(texto) ||
      m.tipoMovimiento?.nombre?.toLowerCase().includes(texto) ||
      m.origen?.nombre?.toLowerCase().includes(texto) ||
      m.monto?.toString().includes(texto)
    );
  }

  eliminar(id: string | undefined) {
    if (!id) return;
    this.movimientoService.eliminarMovimiento(id).subscribe({
      next: () => this.cargarMovimientos(),
      error: () => this.error = 'Error al eliminar el movimiento'
    });
  }

  eliminarPagoPeriodico(id: string | undefined) {
    if (!id) return;
    this.pagoPeriodicoService.eliminar(id).subscribe({
      next: () => this.cargarPagosPeriodicos(),
      error: () => this.error = 'Error al eliminar el pago periódico'
    });
  }
}