import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuarioService';
import { NegocioService } from '../../services/NegocioService';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

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
    private router: Router
  ) {}

  iniciarSesion() {
    this.usuarioService.login(this.correo, this.password).subscribe({
      next: () => this.buscarUsuarioYEntrar(),
      error: () => {
        this.error = 'Correo o contraseña incorrectos';
      },
    });
  }

  private buscarUsuarioYEntrar() {
    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        const mio = usuarios.find((u) => u.correo === this.correo);

        if (!mio) {
          this.error = 'No se encontró el usuario';
          return;
        }

        localStorage.setItem('usuario', JSON.stringify(mio));
        this.negocioService.listarPorUsuario(mio.idUsuario).subscribe({
          next: (negocios) => {
            if (negocios.length > 0) {
              localStorage.setItem('negocio', JSON.stringify(negocios[0]));
              this.router.navigate(['/panel']);
            } else {
              this.router.navigate(['/crear-negocio']);
            }
          },
          error: () => {
            this.error = 'Error al cargar los negocios';
          },
        });
      },
      error: () => {
        this.error = 'Error al buscar el usuario';
      },
    });
  }
}