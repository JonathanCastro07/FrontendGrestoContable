import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuarioService';
import { NegocioService } from '../../services/NegocioService';
import { Router } from '@angular/router';
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
      next: (res) => {
        localStorage.setItem('usuario', JSON.stringify(res));

        // el login no devuelve el id, así que se busca el usuario
        // por correo para sacar su idUsuario
        this.UsuarioService.listar().subscribe({
          next: (usuarios) => {
            const mio = usuarios.find((u) => u.correo === res.correo);

            if (!mio) {
              this.error = 'No se encontró tu usuario';
              return;
            }

            this.NegocioService.listarPorUsuario(mio.idUsuario).subscribe({
              next: (negocios) => {
                if (negocios.length > 0) {
                  localStorage.setItem('negocio', JSON.stringify(negocios[0]));
                  this.router.navigate(['/panel']);
                } else {
                  this.router.navigate(['/crear-negocio']);
                }
              },
              error: () => this.router.navigate(['/crear-negocio'])
            });
          },
          error: () => this.error = 'No se pudo leer tu usuario'
        });
      },
      error: () => {
        this.error = 'Correo o contraseña incorrectos';
      }
    });
  }
}
