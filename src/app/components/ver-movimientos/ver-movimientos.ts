import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovimientoService } from '../../services/MovimientoService';
import { NegocioService } from '../../services/NegocioService';
import { TipoMovimientoService } from '../../services/Tipo-movimientoService';
import { OrigenService } from '../../services/OrigenService';
import { PagoPeriodicoService } from '../../services/PagoPeriodicoService';
import { MovimientoFinancieroRequest, MovimientoFinancieroResponse } from '../../models/movimiento';
import { NegocioResponse } from '../../models/negocio';
import { TipoMovimientoResponse, TipoMovimientoRequest, NaturalezaMovimiento } from '../../models/tipo-movimiento';
import { OrigenResponse, OrigenRequest, TipoOrigen } from '../../models/origen';
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
  tiposMovimiento: TipoMovimientoResponse[] = [];
  origenes: OrigenResponse[] = [];
  pagosPeriodicos: PagoPeriodicoResponse[] = [];

  movimientoEditando: MovimientoFinancieroRequest | null = null;
  idMovimientoEditando: string = '';
  movimientosFiltrados: MovimientoFinancieroResponse[] = [];

  busqueda: string = '';
  mostrarEditar: boolean = false;

  // Campos para crear un Tipo y Origen nuevos al editar
  tipoNombreEditar: string = '';
  naturalezaEditar: string = '';
  origenDescripcionEditar: string = '';
  origenTipoEditar: TipoOrigen | '' = '';

  idNegocioSeleccionado: string = '';
  error: string = '';
  exito: string = '';
  idUsuario: string = '';

  constructor(
    private movimientoService: MovimientoService,
    private negocioService: NegocioService,
    private tipoMovimientoService: TipoMovimientoService,
    private origenService: OrigenService,
    private pagoPeriodicoService: PagoPeriodicoService,
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
        this.movimientosFiltrados = [...data];
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
    this.tipoNombreEditar = '';
    this.naturalezaEditar = '';
    this.origenDescripcionEditar = '';
    this.origenTipoEditar = '';
    this.mostrarEditar = true;
  }

  guardarEdicion() {
    if (!this.movimientoEditando) return;

    if (!this.tipoNombreEditar || !this.naturalezaEditar) {
      this.error = 'Completa el tipo de movimiento y la naturaleza';
      return;
    }
    if (!this.origenDescripcionEditar || !this.origenTipoEditar) {
      this.error = 'Completa la descripción y el tipo del origen';
      return;
    }

    this.error = '';

    const tipo: TipoMovimientoRequest = {
      nombre: this.tipoNombreEditar,
      naturaleza: this.naturalezaEditar as NaturalezaMovimiento
    };

    this.tipoMovimientoService.crear(tipo).subscribe({
      next: (tipoGuardado) => {
        this.tiposMovimiento.push(tipoGuardado);

        const origen: OrigenRequest = {
          descripcion: this.origenDescripcionEditar,
          tipoOrigen: this.origenTipoEditar as TipoOrigen
        };

        this.origenService.crear(origen).subscribe({
          next: (origenGuardado) => {
            this.origenes.push(origenGuardado);

            this.movimientoEditando!.tipoId = tipoGuardado.IdTipo;
            this.movimientoEditando!.origenId = origenGuardado.id;

            this.movimientoService.editarMovimiento(
              this.idMovimientoEditando,
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
          error: () => this.error = 'Error al guardar el origen'
        });
      },
      error: () => this.error = 'Error al guardar el tipo'
    });
  }

  cancelarEdicion() {
    this.mostrarEditar = false;
    this.movimientoEditando = null;
    this.idMovimientoEditando = '';
    this.tipoNombreEditar = '';
    this.naturalezaEditar = '';
    this.origenDescripcionEditar = '';
    this.origenTipoEditar = '';
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

  eliminarPagoPeriodico(id: string | undefined) {
    if (!id) return;
    this.pagoPeriodicoService.eliminar(id).subscribe({
      next: () => this.cargarPagosPeriodicos(),
      error: () => this.error = 'Error al eliminar el pago periódico'
    });
  }
}