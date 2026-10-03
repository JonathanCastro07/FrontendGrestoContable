import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovimientoService } from '../../services/MovimientoService';
import { NegocioService } from '../../services/NegocioService';
import { TipoMovimientoService } from '../../services/Tipo-movimientoService';
import { OrigenService } from '../../services/OrigenService';
import { PeriodoService } from '../../services/PeriodoService';
import { Observable, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
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

// valor especial del <select> para indicar "quiero crear uno nuevo"
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

  // catálogos existentes, para elegir en vez de crear duplicados
  tiposMovimiento: TipoMovimientoResponse[] = [];
  origenes: OrigenResponse[] = [];

  nuevoMovimiento: MovimientoFinancieroRequest = {
    monto: 0,
    fecha: '',
    descricion: '',
    negocioId: '',
    tipoId: '',
    origenId: '',
    periodoId: ''
  };

  // valor elegido en el select: id de uno existente, o OPCION_NUEVO
  tipoSeleccionado: string = '';
  origenSeleccionado: string = '';

  // campos solo para cuando se elige "crear nuevo"
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
  movimientoEditando: MovimientoFinancieroRequest | null = null;
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
    this.tipoMovimientoService.listarTodos().subscribe({
      next: (data) => this.tiposMovimiento = data,
      error: () => this.error = 'Error al cargar los tipos de movimiento'
    });

    this.origenService.listarTodos().subscribe({
      next: (data) => this.origenes = data,
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

    return this.periodoService.listarTodos().pipe(
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

  // devuelve el id del tipo a usar: el elegido, o crea uno nuevo si tocó
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

  // devuelve el id del origen a usar: el elegido, o crea uno nuevo si tocó
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

                this.movimientoService.registrar(this.nuevoMovimiento).subscribe({
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
    this.movimientoService.eliminar(id).subscribe({
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

    this.movimientoService.editar(
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
