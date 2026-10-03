import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, of, switchMap, map } from 'rxjs';
import { MovimientoService } from '../../services/MovimientoService';
import { NegocioService } from '../../services/NegocioService';
import { TipoMovimientoService } from '../../services/Tipo-movimientoService';
import { OrigenService } from '../../services/OrigenService';
import { PeriodoService } from '../../services/PeriodoService';
import {
  MovimientoFinancieroRequest,
  MovimientoFinancieroResponse,
} from '../../models/movimiento';
import { NegocioResponse } from '../../models/negocio';
import { OrigenRequest, OrigenResponse, TipoOrigen } from '../../models/origen';
import {
  NaturalezaMovimiento,
  TipoMovimientoRequest,
  TipoMovimientoResponse,
} from '../../models/tipo-movimiento';

const MESES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const OPCION_NUEVO = '__nuevo__';

@Component({
  selector: 'app-movimientos',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.scss',
})
export class Movimientos implements OnInit {

  movimientos: MovimientoFinancieroResponse[] = [];
  negocios: NegocioResponse[] = [];

  tiposMovimiento: TipoMovimientoResponse[] = [];
  origenes: OrigenResponse[] = [];

  nuevoMovimiento: MovimientoFinancieroRequest = {
    monto: 0,
    fecha: '',
    descricion: '',
    negocioId: '',
    tipoId: '',
    origenId: '',
    periodoId: '',
  };

  tipoSeleccionado: string = '';
  origenSeleccionado: string = '';

  nuevoTipoNombre: string = '';
  nuevaNaturaleza: string = '';
  nuevoOrigenDescripcion: string = '';
  nuevoOrigenTipo: TipoOrigen | '' = '';

  readonly OPCION_NUEVO = OPCION_NUEVO;

  idNegocioSeleccionado: string = '';
  error: string = '';
  exito: string = '';
  mostrarFormulario: boolean = false;
  idUsuario: string = '';

  movimientoEditando: MovimientoFinancieroResponse | null = null;
  idMovimientoEditando: string = '';
  mostrarEditar: boolean = false;
  tipoSeleccionadoEditar: string = '';

  constructor(
    private movimientoService: MovimientoService,
    private negocioService: NegocioService,
    private tipoMovimientoService: TipoMovimientoService,
    private origenService: OrigenService,
    private periodoService: PeriodoService
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
      next: (data) => this.tiposMovimiento = data,
      error: () => this.error = 'Error al cargar los tipos de movimiento'
    });

    this.origenService.listar().subscribe({
      next: (data) => this.origenes = data,
      error: () => this.error = 'Error al cargar los orígenes'
    });
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

  private soloFecha(fecha: string): string {
    return fecha.split('T')[0];
  }

  private obtenerOCrearPeriodoId(fecha: string): Observable<string> {
    const f = new Date(fecha);
    const anio = f.getFullYear();
    const mes = MESES[f.getMonth()];

    return this.periodoService.listarTodo().pipe(
      switchMap((periodos) => {
        const existe = periodos.find((p) => p.mes === mes && p.anio === anio);
        if (existe) {
          return of(existe.idPeriodo);
        }
        return this.periodoService.crear({ mes, anio }).pipe(
          map((nuevo) => nuevo.idPeriodo)
        );
      })
    );
  }

  private resolverTipoId(): Observable<string> {
    if (this.tipoSeleccionado !== OPCION_NUEVO) {
      return of(this.tipoSeleccionado);
    }
    const tipo: TipoMovimientoRequest = {
      nombre: this.nuevoTipoNombre,
      naturaleza: this.nuevaNaturaleza as NaturalezaMovimiento
    };
    return this.tipoMovimientoService.crear(tipo).pipe(
      map((tipoGuardado) => {
        this.tiposMovimiento.push(tipoGuardado);
        return tipoGuardado.IdTipo;
      })
    );
  }

  private resolverOrigenId(): Observable<string> {
    if (this.origenSeleccionado !== OPCION_NUEVO) {
      return of(this.origenSeleccionado);
    }
    const origen: OrigenRequest = {
      descripcion: this.nuevoOrigenDescripcion,
      tipoOrigen: this.nuevoOrigenTipo as TipoOrigen
    };
    return this.origenService.crear(origen).pipe(
      map((origenGuardado) => {
        this.origenes.push(origenGuardado);
        return origenGuardado.id;
      })
    );
  }

  registrar() {
    this.error = '';
    this.exito = '';

    if (!this.tipoSeleccionado) {
      this.error = 'Selecciona un tipo de movimiento';
      return;
    }
    if (this.tipoSeleccionado === OPCION_NUEVO && (!this.nuevoTipoNombre || !this.nuevaNaturaleza)) {
      this.error = 'Completa el nombre y la naturaleza del tipo nuevo';
      return;
    }
    if (!this.origenSeleccionado) {
      this.error = 'Selecciona un origen';
      return;
    }
    if (this.origenSeleccionado === OPCION_NUEVO && (!this.nuevoOrigenDescripcion || !this.nuevoOrigenTipo)) {
      this.error = 'Completa la descripción y el tipo del origen nuevo';
      return;
    }
    if (!this.idNegocioSeleccionado) {
      this.error = 'Selecciona un negocio';
      return;
    }

    this.nuevoMovimiento.fecha = this.soloFecha(this.nuevoMovimiento.fecha);

    this.obtenerOCrearPeriodoId(this.nuevoMovimiento.fecha).subscribe({
      next: (periodoId) => {
        this.nuevoMovimiento.periodoId = periodoId;

        this.resolverTipoId().subscribe({
          next: (tipoId) => {
            this.resolverOrigenId().subscribe({
              next: (origenId) => {
                this.nuevoMovimiento.negocioId = this.idNegocioSeleccionado;
                this.nuevoMovimiento.tipoId = tipoId;
                this.nuevoMovimiento.origenId = origenId;

                this.movimientoService.registrarMovimiento(this.nuevoMovimiento).subscribe({
                  next: () => {
                    this.exito = 'Movimiento registrado exitosamente';
                    this.mostrarFormulario = false;
                    this.resetFormulario();
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
      },
      error: () => this.error = 'Error al obtener el periodo'
    });
  }

  private resetFormulario() {
    this.tipoSeleccionado = '';
    this.origenSeleccionado = '';
    this.nuevoTipoNombre = '';
    this.nuevaNaturaleza = '';
    this.nuevoOrigenDescripcion = '';
    this.nuevoOrigenTipo = '';
    this.nuevoMovimiento = {
      monto: 0,
      fecha: '',
      descricion: '',
      negocioId: '',
      tipoId: '',
      origenId: '',
      periodoId: ''
    };
  }

  eliminar(id: string | undefined) {
    if (!id) return;
    this.movimientoService.eliminarMovimiento(id).subscribe({
      next: () => this.cargarMovimientos(),
      error: () => this.error = 'Error al eliminar el movimiento'
    });
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
}