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
import { OrigenRequest, TipoOrigen } from '../../models/origen';
import {
  NaturalezaMovimiento,
  TipoMovimientoRequest,
} from '../../models/tipo-movimiento';

// el backend guarda el mes como JANUARY, FEBRUARY... (así lo hace ejecutarPago)
const MESES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

@Component({
  selector: 'app-movimientos',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.scss',
})
export class Movimientos implements OnInit {

  movimientos: MovimientoFinancieroResponse[] = [];
  negocios: NegocioResponse[] = [];

  nuevoMovimiento: MovimientoFinancieroRequest = {
    monto: 0,
    fecha: '',
    descricion: '',
    negocioId: '',
    tipoId: '',
    origenId: '',
    periodoId: ''
  };

  tipoNombre: string = '';
  naturaleza: string = '';
  origenNombre: string = '';
  origenTipo: TipoOrigen | '' = '';

  idNegocioSeleccionado: string = '';
  error: string = '';
  exito: string = '';
  mostrarFormulario: boolean = false;
  idUsuario: string = '';
  movimientoEditando: MovimientoFinancieroRequest | null = null;
  idMovimientoEditando: string = '';
  mostrarEditar: boolean = false;
  tipoNombreEditar: string = '';
  naturalezaEditar: string = '';

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

  onTipoChange() {
    this.naturaleza = '';
    this.origenNombre = '';
    this.origenTipo = '';
  }

  // el input es datetime-local ("2026-10-01T21:30") pero el backend
  // espera solo el día, por eso se corta en la T
  private soloFecha(fecha: string): string {
    return fecha.split('T')[0];
  }

  // mismo criterio que ejecutaPago en el backend: busca el periodo del mes
  // y año, y si no existe lo crea
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

  registrar() {
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

    this.nuevoMovimiento.fecha = this.soloFecha(this.nuevoMovimiento.fecha);

    this.obtenerOCrearPeriodoId(this.nuevoMovimiento.fecha).subscribe({
      next: (periodoId) => {
        this.nuevoMovimiento.periodoId = periodoId;
        this.crearMovimientoConTipoYOrigen();
      },
      error: () => this.error = 'Error al obtener el periodo'
    });
  }

  private crearMovimientoConTipoYOrigen() {
    const tipo: TipoMovimientoRequest = {
      nombre: this.tipoNombre,
      naturaleza: this.naturaleza as NaturalezaMovimiento
    };

    this.tipoMovimientoService.crear(tipo).subscribe({
      next: (tipoGuardado) => {
        const origen: OrigenRequest = {
          descripcion: this.origenNombre,
          tipoOrigen: this.origenTipo as TipoOrigen
        };

        this.origenService.crear(origen).subscribe({
          next: (origenGuardado) => {
            this.nuevoMovimiento.negocioId = this.idNegocioSeleccionado;
            this.nuevoMovimiento.tipoId = tipoGuardado.IdTipo;
            this.nuevoMovimiento.origenId = origenGuardado.id;

            this.movimientoService.registrar(this.nuevoMovimiento).subscribe({
              next: () => {
                this.exito = 'Movimiento registrado exitosamente';
                this.mostrarFormulario = false;
                this.tipoNombre = '';
                this.naturaleza = '';
                this.origenNombre = '';
                this.origenTipo = '';
                this.nuevoMovimiento = {
                  monto: 0,
                  fecha: '',
                  descricion: '',
                  negocioId: '',
                  tipoId: '',
                  origenId: '',
                  periodoId: ''
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

  eliminar(id: string | undefined) {
    if (!id) return;
    this.movimientoService.eliminar(id).subscribe({
      next: () => this.cargarMovimientos(),
      error: () => this.error = 'Error al eliminar el movimiento'
    });
  }

  editarMovimiento(movimiento: MovimientoFinancieroResponse) {
    this.movimientoEditando = { ...movimiento };
    this.movimientoEditando.tipoId = movimiento.tipoId;
    this.movimientoEditando.origenId = movimiento.origenId;
    this.movimientoEditando.negocioId = movimiento.negocioId;
    this.movimientoEditando.periodoId = movimiento.periodoId;
    this.tipoNombreEditar = movimiento.tipoId;
    this.naturalezaEditar = '';
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

    const tipo: TipoMovimientoRequest = {
      nombre: this.tipoNombreEditar,
      naturaleza: this.naturalezaEditar as NaturalezaMovimiento
    };

    this.tipoMovimientoService.crear(tipo).subscribe({
      next: (tipoGuardado) => {
        this.movimientoEditando!.tipoId = tipoGuardado.IdTipo;
        this.movimientoService.editar(
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
      error: () => this.error = 'Error al guardar el tipo'
    });
  }

  cancelarEdicion() {
    this.mostrarEditar = false;
    this.movimientoEditando = null;
    this.idMovimientoEditando = '';
    this.tipoNombreEditar = '';
    this.naturalezaEditar = '';
  }
}
