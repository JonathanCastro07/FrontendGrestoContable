import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovimientoService } from '../../services/MovimientoService';
import { NegocioService } from '../../services/NegocioService';
import { TipoMovimientoService } from '../../services/Tipo-movimientoService';
import { OrigenService } from '../../services/OrigenService';
import { Movimiento } from '../../models/movimiento';
import { Negocio } from '../../models/negocio';

@Component({
  selector: 'app-movimientos',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.scss',
})
export class Movimientos implements OnInit {

  movimientos: Movimiento[] = [];
  negocios: Negocio[] = [];

  nuevoMovimiento: Movimiento = {
    monto: 0,
    fecha: '',
    descripcion: '',
    tipoMovimiento: { nombre: '', naturaleza: '' },
    origen: { nombre: '', tipoOrigen: '' }
  };

  tipoNombre: string = '';
  naturaleza: string = '';
  origenNombre: string = '';

  idNegocioSeleccionado: number = 0;
  error: string = '';
  exito: string = '';
  mostrarFormulario: boolean = false;
  idUsuario: number = 0;
  movimientoEditando: Movimiento | null = null;
  mostrarEditar: boolean = false;
  tipoNombreEditar: string = '';
  naturalezaEditar: string = '';

  constructor(
    private movimientoService: MovimientoService,
    private negocioService: NegocioService,
    private tipoMovimientoService: TipoMovimientoService,
    private origenService: OrigenService
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
        if (data.length > 0) {
          this.negocios = data;
          this.idNegocioSeleccionado = data[0].idNegocio!;
          this.cargarMovimientos();
        }
      },
      error: () => this.error = 'Error al cargar el negocio'
    });
  }

  cargarMovimientos() {
    const id = Number(this.idNegocioSeleccionado);
    if (!id) return;
    this.movimientoService.listarPorNegocio(id).subscribe({
      next: (data) => this.movimientos = data,
      error: () => this.error = 'Error al cargar movimientos'
    });
  }

  onTipoChange() {
    this.nuevoMovimiento.tipoMovimiento = {
      nombre: this.tipoNombre,
      naturaleza: ''
    };
    this.naturaleza = '';
    this.nuevoMovimiento.origen = { nombre: '', tipoOrigen: '' };
  }

  registrar() {
    if (!this.tipoNombre) {
      this.error = 'Selecciona un tipo de movimiento';
      return;
    }
    if (!this.naturaleza) {
      this.error = 'Selecciona la naturaleza del movimiento';
      return;
    }
    if (!this.nuevoMovimiento.origen?.nombre) {
      this.error = 'Ingresa el nombre del origen';
      return;
    }
    if (!this.nuevoMovimiento.origen?.tipoOrigen) {
      this.error = 'Selecciona el tipo de origen';
      return;
    }

    this.nuevoMovimiento.tipoMovimiento = {
      nombre: this.tipoNombre,
      naturaleza: this.naturaleza
    };

    this.tipoMovimientoService.crear(this.nuevoMovimiento.tipoMovimiento!).subscribe({
      next: (tipoGuardado) => {
        this.origenService.crear(this.nuevoMovimiento.origen!).subscribe({
          next: (origenGuardado) => {
            this.nuevoMovimiento.tipoMovimiento = tipoGuardado;
            this.nuevoMovimiento.origen = origenGuardado;
            this.nuevoMovimiento.negocio = {
              idNegocio: this.idNegocioSeleccionado,
              nombreNegocio: '',
              tipoActividad: '',
              capitalInicial: 0
            };
            this.movimientoService.registrar(this.nuevoMovimiento).subscribe({
              next: () => {
                this.exito = 'Movimiento registrado exitosamente';
                this.mostrarFormulario = false;
                this.tipoNombre = '';
                this.naturaleza = '';
                this.nuevoMovimiento = {
                  monto: 0,
                  fecha: '',
                  descripcion: '',
                  tipoMovimiento: { nombre: '', naturaleza: '' },
                  origen: { nombre: '', tipoOrigen: '' }
                };
                this.cargarMovimientos();
              },
              error: () => this.error = 'Error al registrar el movimiento'
            });
          },
          error: () => this.error = 'Error al guardar el origen'
        });
      },
      error: () => this.error = 'Error al guardar el tipo'
    });
  }

  eliminar(id: number | undefined) {
    if (!id) return;
    this.movimientoService.eliminar(id).subscribe({
      next: () => this.cargarMovimientos(),
      error: () => this.error = 'Error al eliminar el movimiento'
    });
  }

  editarMovimiento(movimiento: Movimiento) {
  this.movimientoEditando = { ...movimiento };
  this.tipoNombreEditar = movimiento.tipoMovimiento?.nombre || '';
  this.naturalezaEditar = movimiento.tipoMovimiento?.naturaleza || '';
  this.mostrarEditar = true;
}

guardarEdicion() {
  if (!this.movimientoEditando) return;

  if (!this.tipoNombreEditar) {
    this.error = 'Selecciona un tipo de movimiento';
    return;
  }
  if (!this.naturalezaEditar) {
    this.error = 'Selecciona la naturaleza';
    return;
  }

  this.movimientoEditando.tipoMovimiento = {
    nombre: this.tipoNombreEditar,
    naturaleza: this.naturalezaEditar
  };

  this.tipoMovimientoService.crear(this.movimientoEditando.tipoMovimiento).subscribe({
    next: (tipoGuardado) => {
      this.movimientoEditando!.tipoMovimiento = tipoGuardado;
      this.movimientoService.editar(
        this.movimientoEditando!.idMovimiento!,
        this.movimientoEditando!
      ).subscribe({
        next: () => {
          this.exito = 'Movimiento actualizado exitosamente';
          this.mostrarEditar = false;
          this.movimientoEditando = null;
          this.cargarMovimientos();
        },
        error: () => this.error = 'Error al editar el movimiento'
      });
    },
    error: () => this.error = 'Error al guardar el tipo'
  });
}

cancelarEdicion() {
  this.mostrarEditar = false;
  this.movimientoEditando = null;
  this.tipoNombreEditar = '';
  this.naturalezaEditar = '';
}
}