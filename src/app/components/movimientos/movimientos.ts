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
import { TipoMovimientoRequest } from '../../models/tipo-movimiento';
import { OrigenRequest } from '../../models/origen';
import { PeriodoRequest } from '../../models/periodo';

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

  tipoNombre: string = '';
  naturaleza: 'DEBITO' | 'CREDITO' = 'DEBITO';
  origenDescripcion: string = '';
  tipoOrigen: 'PROVEEDOR' | 'TRABAJADOR' | 'SERVICIO_PUBLICO' | 'FACTURA' | 'CLIENTE' | 'OTRO' = 'OTRO';

  idNegocioSeleccionado: string = '';
  error: string = '';
  exito: string = '';
  mostrarFormulario: boolean = false;
  idUsuario: string = '';

  movimientoEditando: MovimientoFinancieroResponse | null = null;
  mostrarEditar: boolean = false;
  tipoNombreEditar: string = '';
  naturalezaEditar: 'DEBITO' | 'CREDITO' = 'DEBITO';

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
      error: () => {
        this.error = 'Error al cargar el negocio';
      },
    });
  }

  cargarMovimientos() {
    const id = this.idNegocioSeleccionado;
    if (!id) return;

    this.movimientoService.listarPorNegocio(id).subscribe({
      next: (data) => {
        this.movimientos = data;
      },
      error: () => {
        this.error = 'Error al cargar movimientos';
      },
    });
  }

  onNegocioChange() {
    this.cargarMovimientos();
  }

  onTipoChange() {
    this.naturaleza = this.tipoNombre.toLowerCase().includes('ingreso') ? 'CREDITO' : 'DEBITO';
    this.origenDescripcion = '';
  }

  registrar() {
    this.error = '';
    this.exito = '';

    if (!this.tipoNombre) {
      this.error = 'Selecciona un tipo de movimiento';
      return;
    }
    if (!this.origenDescripcion) {
      this.error = 'Ingresa la descripción del origen';
      return;
    }
    if (!this.nuevoMovimiento.monto) {
      this.error = 'Ingresa el monto';
      return;
    }
    if (!this.idNegocioSeleccionado) {
      this.error = 'Selecciona un negocio';
      return;
    }

    const soloFecha = this.nuevoMovimiento.fecha.split('T')[0];
    if (!soloFecha) {
      this.error = 'Ingresa la fecha';
      return;
    }

    const tipo: TipoMovimientoRequest = {
      nombre: this.tipoNombre,
      naturaleza: this.naturaleza,
    };
    const origen: OrigenRequest = {
      descripcion: this.origenDescripcion,
      tipoOrigen: this.tipoOrigen,
    };

    this.tipoMovimientoService.crear(tipo).subscribe({
      next: (tipoGuardado) => {
        this.origenService.crear(origen).subscribe({
          next: (origenGuardado) => {
            this.obtenerOCrearPeriodo(soloFecha).subscribe((periodoId) => {
              const movimiento: MovimientoFinancieroRequest = {
                monto: this.nuevoMovimiento.monto,
                fecha: soloFecha,
                descricion: this.nuevoMovimiento.descricion,
                negocioId: this.idNegocioSeleccionado,
                tipoId: tipoGuardado.IdTipo,
                origenId: origenGuardado.id,
                periodoId: periodoId,
              };

              this.movimientoService.registrarMovimiento(movimiento).subscribe({
                next: () => {
                  this.exito = 'Movimiento registrado exitosamente';
                  this.mostrarFormulario = false;
                  this.tipoNombre = '';
                  this.origenDescripcion = '';
                  this.nuevoMovimiento = {
                    monto: 0,
                    fecha: '',
                    descricion: '',
                    negocioId: '',
                    tipoId: '',
                    origenId: '',
                    periodoId: '',
                  };
                  this.cargarMovimientos();
                },
                error: () => {
                  this.error = 'Error al registrar el movimiento';
                },
              });
            });
          },
          error: () => {
            this.error = 'Error al guardar el origen';
          },
        });
      },
      error: () => {
        this.error = 'Error al guardar el tipo';
      },
    });
  }

  obtenerOCrearPeriodo(fecha: string): Observable<string> {
    const partes = fecha.split('-');
    const anio = Number(partes[0]);
    const meses = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
    ];
    const mes = meses[Number(partes[1]) - 1];

    return this.periodoService.listarTodo().pipe(
      switchMap((periodos) => {
        const existe = periodos.find((p) => p.mes === mes && p.anio === anio);
        if (existe) return of(existe.idPeriodo);

        const nuevo: PeriodoRequest = { mes, anio };
        return this.periodoService.crear(nuevo).pipe(map((p) => p.idPeriodo));
      })
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

  editarMovimiento(movimiento: MovimientoFinancieroResponse) {
    this.movimientoEditando = { ...movimiento };
    this.mostrarEditar = true;
  }

  guardarEdicion() {
    if (!this.movimientoEditando) return;

    const editando = this.movimientoEditando;
    const soloFecha = editando.fecha.split('T')[0];

    editando.fecha = soloFecha;
    this.movimientoService.editarMovimiento(editando.idMovimiento, editando).subscribe({
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
}