import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuarioService';
import { NegocioService } from '../../services/NegocioService';
import { UsuarioResponse, RegistroRequest } from '../../models/usuario';
import { NegocioResponse } from '../../models/negocio';

@Component({
  selector: 'app-configuracion',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss',
})
export class Configuracion implements OnInit {
  usuario: UsuarioResponse | null = null;
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
    private router: Router
  ) {}

  ngOnInit() {
    const dataUsuario = localStorage.getItem('usuario');
    const dataNegocio = localStorage.getItem('negocio');

    if (dataUsuario) this.usuario = JSON.parse(dataUsuario);
    if (dataNegocio) this.negocio = JSON.parse(dataNegocio);

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

    const id = this.usuario?.idUsuario;
    if (!id) return;

    const usuarioActualizado: RegistroRequest = {
      nombre: this.usuario!.nombre,
      correo: this.nuevoCorreo,
      password: '',
      preguntaSeguridad: '',
    };

    this.usuarioService.actualizar(id, usuarioActualizado).subscribe({
      next: (data) => {
        localStorage.setItem('usuario', JSON.stringify(data));
        this.usuario = data;
        this.exito = 'Correo actualizado exitosamente';
        this.nuevoCorreo = '';
        this.confirmarCorreo = '';
      },
      error: () => {
        this.error = 'Error al actualizar el correo';
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

    const id = this.usuario?.idUsuario;
    if (!id) return;

    const usuarioActualizado: RegistroRequest = {
      nombre: this.usuario!.nombre,
      correo: this.usuario!.correo,
      password: this.nuevaPassword,
      preguntaSeguridad: '',
    };

    this.usuarioService.actualizar(id, usuarioActualizado).subscribe({
      next: (data) => {
        localStorage.setItem('usuario', JSON.stringify(data));
        this.usuario = data;
        this.exito = 'Contraseña actualizada exitosamente';
        this.passwordActual = '';
        this.nuevaPassword = '';
        this.confirmarPassword = '';
      },
      error: () => {
        this.error = 'Error al actualizar la contraseña';
      },
    });
  }

  borrarNegocio() {
    if (!confirm('¿Estás seguro de que quieres borrar tu negocio? Esta acción no se puede deshacer.')) return;
    const id = this.negocio?.idNegocio;
    if (!id) return;

    this.negocioService.eliminar(id).subscribe({
      next: () => {
        localStorage.removeItem('negocio');
        this.router.navigate(['/crear-negocio']);
      },
      error: () => {
        this.error = 'Error al borrar el negocio';
      },
    });
  }
}