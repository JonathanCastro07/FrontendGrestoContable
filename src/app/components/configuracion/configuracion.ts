import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuarioService';
import { NegocioService } from '../../services/NegocioService';
import { AuthService } from '../../services/AuthService';
import { UsuarioSesion } from '../../models/usuario';
import { NegocioResponse } from '../../models/negocio';

@Component({
  selector: 'app-configuracion',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss',
})
export class Configuracion implements OnInit {
  usuario: UsuarioSesion | null = null;
  negocio: NegocioResponse | null = null;

  nuevoCorreo: string = '';
  confirmarCorreo: string = '';

  passwordActual: string = '';
  nuevaPassword: string = '';
  confirmarPassword: string = '';

  error: string = '';
  exito: string = '';
  seccionActiva: string = 'correo';

  constructor(
    private usuarioService: UsuarioService,
    private negocioService: NegocioService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.usuario = this.auth.getUsuario();
    this.negocio = this.auth.getNegocio();

    if (!this.usuario) this.router.navigate(['/login']);
  }

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
    this.error = '';
    this.exito = '';
  }

  cambiarCorreo() {
    this.error = '';
    this.exito = '';

    if (!this.nuevoCorreo) {
      this.error = 'Ingresa el nuevo correo';
      return;
    }
    if (this.nuevoCorreo !== this.confirmarCorreo) {
      this.error = 'Los correos no coinciden';
      return;
    }

    this.usuarioService.cambiarCorreo(this.nuevoCorreo).subscribe({
      next: () => {
        // El token está firmado con el correo anterior: hay que iniciar sesión de nuevo
        alert('Correo actualizado. Inicia sesión con tu nuevo correo.');
        this.auth.limpiarSesion();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.error = 'Error al actualizar el correo (¿ya está en uso?)';
      },
    });
  }

  cambiarPassword() {
    this.error = '';
    this.exito = '';

    if (!this.passwordActual) {
      this.error = 'Ingresa tu contraseña actual';
      return;
    }
    if (!this.nuevaPassword) {
      this.error = 'Ingresa la nueva contraseña';
      return;
    }
    if (this.nuevaPassword !== this.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    // La contraseña actual la valida el backend
    this.usuarioService.cambiarPassword(this.passwordActual, this.nuevaPassword).subscribe({
      next: () => {
        this.exito = 'Contraseña actualizada exitosamente';
        this.passwordActual = '';
        this.nuevaPassword = '';
        this.confirmarPassword = '';
      },
      error: () => {
        this.error = 'La contraseña actual no es correcta';
      },
    });
  }

  borrarNegocio() {
    const idActual = this.negocio?.idNegocio;
    if (!idActual) return;

    this.negocioService.misNegocios().subscribe({
      next: (lista) => {
        // El usuario va embebido en el negocio: si es el único, se pierde también la cuenta
        const esUnico = lista.length <= 1;
        const aviso = esUnico
          ? 'Este es tu único negocio. Si lo borras también se elimina tu cuenta. Esta acción no se puede deshacer. ¿Continuar?'
          : '¿Estás seguro de que quieres borrar este negocio? Esta acción no se puede deshacer.';
        if (!confirm(aviso)) return;

        this.negocioService.eliminar(idActual).subscribe({
          next: () => {
            if (esUnico) {
              this.auth.limpiarSesion();
              this.router.navigate(['/login']);
            } else {
              const restantes = lista.filter((n) => n.idNegocio !== idActual);
              this.auth.guardarNegocio(restantes[0]);
              this.router.navigate(['/panel']);
            }
          },
          error: () => {
            this.error = 'Error al borrar el negocio';
          },
        });
      },
      error: () => {
        this.error = 'Error al consultar tus negocios';
      },
    });
  }
}