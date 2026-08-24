import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuarioService';
import { NegocioService } from '../../services/NegocioService';
import { Route, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login',
  imports: [FormsModule,RouterLink,CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  correo: string = '';
  password: string = '';
  error: string = '';

  constructor(
    private UsuarioService: UsuarioService,
    private NegocioService: NegocioService,
    private router: Router
  ) {}

iniciarSesion() {
  this.UsuarioService.login(this.correo, this.password).subscribe({
    next: (usuario) => {
      localStorage.setItem('usuario', JSON.stringify(usuario));

      this.NegocioService.listarPorUsuario(usuario.idUsuario!).subscribe({
        next: (negocios) => {
          if (negocios.length > 0) {
            localStorage.setItem('negocio', JSON.stringify(negocios[0]));
            this.router.navigate(['/panel']);
          } else {
            this.router.navigate(['/crear-negocio']);
          }
        }
      });
    },
    error: () => {
      this.error = 'Correo o contraseña incorrectos';
    }
  });
}
}
