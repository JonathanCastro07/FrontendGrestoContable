import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovimientoService } from '../../services/MovimientoService';
import { NegocioService } from '../../services/NegocioService';
import { TipoMovimientoService } from '../../services/Tipo-movimientoService';
import { OrigenService } from '../../services/OrigenService';
import { MovimientoFinancieroRequest, MovimientoFinancieroResponse } from '../../models/movimiento';
import { NegocioResponse } from '../../models/negocio';
import { TipoMovimientoResponse } from '../../models/tipo-movimiento';
import { OrigenResponse } from '../../models/origen';

@Component({
  selector: 'app-ver-movimientos',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './ver-movimientos.html',
  styleUrl: './ver-movimientos.scss',
})
export class VerMovimientos implements OnInit {

  movimientos: MovimientoFinancieroResponse[] = [];
  negocios: NegocioResponse[] = [];
  tiposMovimiento: TipoMovimientoResponse[] = [];
  origenes: OrigenResponse[] = [];

  movimientoEditando: MovimientoFinancieroRequest | null = null;
  idMovimientoEditando: string = '';
  movimientosFiltrados: MovimientoFinancieroResponse[] = [];

  busqueda: string = '';
  mostrarEditar: boolean = false;
  tipoSeleccionadoEditar: string = '';

  idNegocioSeleccionado: string = '';
  error: string = '';
  exito: string = '';
  idUsuario: string = '';

  constructor(
    private movimientoService: MovimientoService,
    private negocioService: NegocioService,
    private tipoMovimientoService: TipoMovimientoService,
    private origenService: OrigenService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      const usuario = JSON.parse(data);
      this.idUsuario = usuario.idUsuario;
      this.cargarNegocioYMovimientos();
    }
    this.cargarCatalogos();
  }

  cargarCatalogos() {
    this.tipoMovimientoService.listarTodo().subscribe({
      next: (data) => { this.tiposMovimiento = data; this.cd.detectChanges(); },
      error: () => this.error = 'Error al cargar los tipos de movimiento'
    });
    this.origenService.listar().subscribe({
      next: (data) => { this.origenes = data; this.cd.detectChanges(); },
      error: () => this.error = 'Error al cargar los orígenes'
    });
  }

  cargarNegocioYMovimientos() {
    this.negocioService.listarPorUsuario(this.idUsuario).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.negocios = data;
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
      next: (data) => {
        this.movimientos = [...data];
        this.movimientosFiltrados = [...data];
        this.cd.detectChanges();
      },
      error: () => this.error = 'Error al cargar movimientos'
    });
  }

  nombreTipo(id: string): string {
    const tipo = this.tiposMovimiento.find(t => t.IdTipo === id);
    return tipo ? `${tipo.nombre} (${tipo.naturaleza})` : '—';
  }

  nombreOrigen(id: string): string {
    const origen = this.origenes.find(o => o.id === id);
    return origen ? origen.descripcion : '—';
  }

  editarMovimiento(movimiento: MovimientoFinancieroResponse) {
    this.movimientoEditando = { ...movimiento };
    this.idMovimientoEditando = movimiento.idMovimiento;
    this.tipoSeleccionadoEditar = movimiento.tipoId;
    this.mostrarEditar = true;
  }

  guardarEdicion() {
    if (!this.movimientoEditando) return;
    if (!this.tipoSeleccionadoEditar) {
      this.error = 'Selecciona un tipo de movimiento';
      return;
    }

    this.movimientoEditando.tipoId = this.tipoSeleccionadoEditar;

    this.movimientoService.editarMovimiento(
      this.idMovimientoEditando,
      this.movimientoEditando
    ).subscribe({
      next: () => {
        this.exito = 'Movimiento actualizado exitosamente';
        this.mostrarEditar = false;
        this.movimientoEditando = null;
        this.cargarMovimientos();
      },
      error: () => this.error = 'Error al editar el movimiento'
    });
  }

  cancelarEdicion() {
    this.mostrarEditar = false;
    this.movimientoEditando = null;
    this.idMovimientoEditando = '';
    this.tipoSeleccionadoEditar = '';
  }

  buscar() {
    if (!this.busqueda.trim()) {
      this.movimientosFiltrados = [...this.movimientos];
      return;
    }
    const texto = this.busqueda.toLowerCase();
    this.movimientosFiltrados = this.movimientos.filter(m =>
      m.descricion?.toLowerCase().includes(texto) ||
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
}