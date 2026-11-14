import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuarioService';
import { NegocioService } from '../../services/NegocioService';
import { AuthService } from '../../services/AuthService';
import { RegistroRequest } from '../../models/usuario';
import { AuthPanel } from '../auth-panel/auth-panel';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink, CommonModule, AuthPanel],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  // Un solo objeto con datos del usuario + su primer negocio.
  // Los dos pasos del formulario solo lo muestran por partes: no se envía nada hasta "Crear cuenta".
  registro: RegistroRequest = {
    nombre: '',
    correo: '',
    password: '',
    telefono: '',
    preguntaSeguridad: '',
    respuestaSeguridad: '',
    nombreNegocio: '',
    tipoActividad: '',
    capitalInicial: 0,
    rolPropietario: '',
  };

  paso: 1 | 2 = 1;
  errores: Record<string, string> = {};
  verPassword = false;
  cargando = false;

  error: string = '';
  exito: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private negocioService: NegocioService,
    private auth: AuthService,
    private router: Router
  ) {}

  // ---------- Navegación entre pasos ----------

  siguiente() {
    this.error = '';
    if (!this.validarPaso1()) return;
    this.paso = 2;
  }

  volver() {
    this.error = '';
    this.errores = {};
    this.paso = 1;
  }

  quitarError(campo: string) {
    if (this.errores[campo]) {
      const { [campo]: _quitado, ...resto } = this.errores;
      this.errores = resto;
    }
  }

  // ---------- Validaciones ----------

  private validarPaso1(): boolean {
    const r = this.registro;
    const e: Record<string, string> = {};

    if (!r.nombre.trim()) e['nombre'] = 'Ingresa tu nombre completo';
    if (!r.correo.trim()) e['correo'] = 'Ingresa tu correo electrónico';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.correo.trim())) e['correo'] = 'El correo no es válido';
    if (!r.password) e['password'] = 'Ingresa una contraseña';
    if (!r.preguntaSeguridad.trim()) e['preguntaSeguridad'] = 'Ingresa tu pregunta de seguridad';
    if (!r.respuestaSeguridad.trim()) e['respuestaSeguridad'] = 'Ingresa tu respuesta de seguridad';

    this.errores = e;
    return Object.keys(e).length === 0;
  }

  private validarPaso2(): boolean {
    const r = this.registro;
    const e: Record<string, string> = {};

    if (!r.nombreNegocio.trim()) e['nombreNegocio'] = 'Ingresa el nombre de tu negocio';
    if (!r.tipoActividad) e['tipoActividad'] = 'Selecciona el tipo de actividad';
    if (!r.rolPropietario) e['rolPropietario'] = 'Selecciona tu rol';
    if (r.capitalInicial === null || r.capitalInicial === undefined || r.capitalInicial < 0) {
      e['capitalInicial'] = 'El capital inicial no puede ser negativo';
    }

    this.errores = e;
    return Object.keys(e).length === 0;
  }

  // ---------- Envío (solo desde el paso 2) ----------

  registrar() {
    this.error = '';
    this.exito = '';

    if (!this.validarPaso1()) {
      this.paso = 1;
      return;
    }
    if (!this.validarPaso2()) return;

    this.cargando = true;
    this.usuarioService.registrar(this.registro).subscribe({
      next: () => {
        this.exito = 'Cuenta y negocio creados exitosamente';
        this.iniciarSesionAutomatico();
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudo registrar. Es posible que el correo ya esté registrado';
      },
    });
  }

  // Después de registrarse entra directo al panel
  private iniciarSesionAutomatico() {
    this.usuarioService.login(this.registro.correo, this.registro.password).subscribe({
      next: (resp) => {
        this.auth.guardarSesion(resp);
        this.negocioService.misNegocios().subscribe({
          next: (negocios) => {
            if (negocios.length > 0) this.auth.guardarNegocio(negocios[0]);
            this.router.navigate(['/panel']);
          },
          error: () => this.router.navigate(['/login']),
        });
      },
      error: () => setTimeout(() => this.router.navigate(['/login']), 1500),
    });
  }
}