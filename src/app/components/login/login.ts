import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuarioService';
import { NegocioService } from '../../services/NegocioService';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  correo: string = '';
  password: string = '';
  error: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private negocioService: NegocioService,
    private auth: AuthService,
    private router: Router
  ) {}

  iniciarSesion() {
    this.error = '';
    if (!this.correo || !this.password) {
      this.error = 'Ingresa tu correo y contraseña';
      return;
    }

    this.usuarioService.login(this.correo, this.password).subscribe({
      next: (resp) => {
        // Guarda el token y los datos básicos; el interceptor lo envía en cada petición
        this.auth.guardarSesion(resp);
        this.cargarNegociosYEntrar();
      },
      error: () => {
        this.error = 'Correo o contraseña incorrectos';
      },
    });
  }

  private cargarNegociosYEntrar() {
    this.negocioService.misNegocios().subscribe({
      next: (negocios) => {
        if (negocios.length > 0) {
          this.auth.guardarNegocio(negocios[0]);
          this.router.navigate(['/panel']);
        } else {
          this.router.navigate(['/crear-negocio']);
        }
      },
      error: () => {
        this.error = 'Error al cargar los negocios';
      },
    });
  }
}