import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuarioService';
import { NegocioService } from '../../services/NegocioService';
import { AuthService } from '../../services/AuthService';
import { RegistroRequest } from '../../models/usuario';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  // Un solo formulario: datos del usuario + su primer negocio
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

  error: string = '';
  exito: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private negocioService: NegocioService,
    private auth: AuthService,
    private router: Router
  ) {}

  registrar() {
    this.error = '';
    this.exito = '';

    const r = this.registro;
    if (!r.nombre || !r.correo || !r.password || !r.preguntaSeguridad || !r.respuestaSeguridad) {
      this.error = 'Completa los datos de tu cuenta';
      return;
    }
    if (!r.nombreNegocio || !r.tipoActividad || !r.rolPropietario) {
      this.error = 'Completa los datos de tu negocio';
      return;
    }

    this.usuarioService.registrar(r).subscribe({
      next: () => {
        this.exito = 'Cuenta y negocio creados exitosamente';
        this.iniciarSesionAutomatico();
      },
      error: () => {
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