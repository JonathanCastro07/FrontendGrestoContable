import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

@Component({
  selector: 'app-ver-movimientos',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './ver-movimientos.html',
  styleUrl: './ver-movimientos.scss',
})
export class VerMovimientos implements OnInit {
  movimientos: MovimientoFinancieroResponse[] = [];
  negocios: NegocioResponse[] = [];
  movimientoEditando: MovimientoFinancieroResponse | null = null;
  movimientosFiltrados: MovimientoFinancieroResponse[] = [];

  busqueda: string = '';
  mostrarEditar: boolean = false;

  idNegocioSeleccionado: string = '';
  error: string = '';
  exito: string = '';
  idUsuario: string = '';

  constructor(
    private movimientoService: MovimientoService,
    private negocioService: NegocioService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      const usuario = JSON.parse(data);
      this.idUsuario = usuario.idUsuario;
      this.cargarNegocioYMovimientos();
    }
  }

  cargarNegocioYMovimientos() {
    this.negocioService.listarPorUsuario(this.idUsuario).subscribe({
      next: (data) => {
        this.negocios = data;
        if (data.length > 0) {
          this.idNegocioSeleccionado = data[0].idNegocio;
          this.cargarMovimientos();
        }
      },
      error: () => {
        this.error = 'Error al cargar el negocio';
      },
    });
  }

  onNegocioChange() {
    this.cargarMovimientos();
  }

  cargarMovimientos() {
    const id = this.idNegocioSeleccionado;
    if (!id) return;

    this.movimientoService.listarPorNegocio(id).subscribe({
      next: (data) => {
        this.movimientos = [...data];
        this.movimientosFiltrados = [...data];
        this.cd.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar movimientos';
      },
    });
  }

  editarMovimiento(movimiento: MovimientoFinancieroResponse) {
    this.movimientoEditando = { ...movimiento };
    this.mostrarEditar = true;
  }

  guardarEdicion() {
    if (!this.movimientoEditando) return;

    const editando = this.movimientoEditando;
    editando.fecha = editando.fecha.split('T')[0];

    const cuerpo: MovimientoFinancieroRequest = {
      monto: editando.monto,
      fecha: editando.fecha,
      descricion: editando.descricion,
      negocioId: editando.negocioId,
      tipoId: editando.tipoId,
      origenId: editando.origenId,
      periodoId: editando.periodoId,
    };

    this.movimientoService.editarMovimiento(editando.idMovimiento, cuerpo).subscribe({
      next: () => {
        this.exito = 'Movimiento actualizado exitosamente';
        this.mostrarEditar = false;
        this.movimientoEditando = null;
        this.cargarMovimientos();
      },
      error: () => {
        this.error = 'Error al editar el movimiento';
      },
    });
  }

  cancelarEdicion() {
    this.mostrarEditar = false;
    this.movimientoEditando = null;
  }

  buscar() {
    if (!this.busqueda.trim()) {
      this.movimientosFiltrados = [...this.movimientos];
      return;
    }

    const texto = this.busqueda.toLowerCase();
    this.movimientosFiltrados = this.movimientos.filter((m) =>
      m.descricion?.toLowerCase().includes(texto) ||
      m.monto?.toString().includes(texto)
    );
  }

  eliminar(id: string | undefined) {
    if (!id) return;
    this.movimientoService.eliminarMovimiento(id).subscribe({
      next: () => this.cargarMovimientos(),
      error: () => {
        this.error = 'Error al eliminar el movimiento';
      },
    });
  }
}