import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovimientoService } from '../../services/MovimientoService';
import { NegocioService } from '../../services/NegocioService';
import { TipoMovimientoService } from '../../services/Tipo-movimientoService';
import { Movimiento } from '../../models/movimiento';
import { Negocio } from '../../models/negocio';

@Component({
  selector: 'app-ver-movimientos',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './ver-movimientos.html',
  styleUrl: './ver-movimientos.scss',
})
export class VerMovimientos implements OnInit {

  movimientos: Movimiento[] = [];
  negocios: Negocio[] = [];
  movimientoEditando: Movimiento | null = null;
  movimientosFiltrados: Movimiento[] = [];

  busqueda: string = '';
  mostrarEditar: boolean = false;
  tipoNombreEditar: string = '';
  naturalezaEditar: string = '';

  idNegocioSeleccionado: number = 0;
  error: string = '';
  exito: string = '';
  idUsuario: number = 0;

  constructor(
    private movimientoService: MovimientoService,
    private negocioService: NegocioService,
    private tipoMovimientoService: TipoMovimientoService,
    private cd: ChangeDetectorRef
  ) {}

ngOnInit() {
  const data = localStorage.getItem('usuario');
  console.log('Usuario:', data); 
  if (data) {
    const usuario = JSON.parse(data);
    console.log('idUsuario:', usuario.idUsuario);
    this.idUsuario = usuario.idUsuario;
    this.cargarNegocioYMovimientos();
  }
}

  cargarNegocioYMovimientos() {
    this.negocioService.listarPorUsuario(this.idUsuario).subscribe({
      next: (data) => {
            console.log('Negocios:', data); 
            console.log('Length:', data.length); 
        if (data.length > 0) {
          this.negocios = data;
          this.idNegocioSeleccionado = data[0].idNegocio!;
          console.log('idNegocio:', this.idNegocioSeleccionado);
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
    next: (data) => {
      this.movimientos = [...data];
      this.movimientosFiltrados = [...data];
      this.cd.detectChanges();
    },
    error: () => this.error = 'Error al cargar movimientos'
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

  buscar() {
  if (!this.busqueda.trim()) {
    this.movimientosFiltrados = [...this.movimientos];
    return;
  }
  const texto = this.busqueda.toLowerCase();
  this.movimientosFiltrados = this.movimientos.filter(m =>
    m.descripcion?.toLowerCase().includes(texto) ||
    m.tipoMovimiento?.nombre?.toLowerCase().includes(texto) ||
    m.origen?.nombre?.toLowerCase().includes(texto) ||
    m.monto?.toString().includes(texto)
  );
}

  eliminar(id: number | undefined) {
    if (!id) return;
    this.movimientoService.eliminar(id).subscribe({
      next: () => this.cargarMovimientos(),
      error: () => this.error = 'Error al eliminar el movimiento'
    });
  }
}
