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
import { OrigenRequest, TipoOrigen } from '../../models/origen';
import { NaturalezaMovimiento, TipoMovimientoRequest } from '../../models/tipo-movimiento';

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
    periodoId: '',
  };

  // campos para crear el Tipo de Movimiento nuevo
  tipoNombre: string = '';
  naturaleza: string = '';

  // campos para crear el Origen nuevo
  origenDescripcion: string = '';
  origenTipo: TipoOrigen | '' = '';

  idNegocioSeleccionado: string = '';
  error: string = '';
  exito: string = '';
  mostrarFormulario: boolean = false;
  idUsuario: string = '';

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
    this.origenDescripcion = '';
    this.origenTipo = '';
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

  registrar() {
    this.error = '';
    this.exito = '';

    if (!this.tipoNombre) {
      this.error = 'Selecciona un tipo de movimiento';
      return;
    }
    if (!this.naturaleza) {
      this.error = 'Selecciona la naturaleza del movimiento';
      return;
    }
    if (!this.origenDescripcion) {
      this.error = 'Ingresa la descripción del origen';
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

        const tipo: TipoMovimientoRequest = {
          nombre: this.tipoNombre,
          naturaleza: this.naturaleza as NaturalezaMovimiento
        };

        this.tipoMovimientoService.crear(tipo).subscribe({
          next: (tipoGuardado) => {
            const origen: OrigenRequest = {
              descripcion: this.origenDescripcion,
              tipoOrigen: this.origenTipo as TipoOrigen
            };

            this.origenService.crear(origen).subscribe({
              next: (origenGuardado) => {
                this.nuevoMovimiento.negocioId = this.idNegocioSeleccionado;
                this.nuevoMovimiento.tipoId = tipoGuardado.IdTipo;
                this.nuevoMovimiento.origenId = origenGuardado.id;

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
    this.tipoNombre = '';
    this.naturaleza = '';
    this.origenDescripcion = '';
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
  }

  eliminar(id: string | undefined) {
    if (!id) return;
    this.movimientoService.eliminarMovimiento(id).subscribe({
      next: () => this.cargarMovimientos(),
      error: () => this.error = 'Error al eliminar el movimiento'
    });
  }
}