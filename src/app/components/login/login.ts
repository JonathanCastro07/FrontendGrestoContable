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
            console.log('[login] usuario encontrado:', mio);

            if (!mio) {
              this.error = 'No se encontró tu usuario';
              return;
            }

            // guardamos también el idUsuario: el resto de componentes lo leen de aquí
            localStorage.setItem('usuario', JSON.stringify({ ...res, idUsuario: mio.idUsuario }));

            this.NegocioService.listarPorUsuario(mio.idUsuario).subscribe({
              next: (negocios) => {
                console.log('[login] negocios del usuario:', negocios);
                if (negocios.length > 0) {
                  localStorage.setItem('negocio', JSON.stringify(negocios[0]));
                  this.router.navigate(['/panel']);
                } else {
                  this.router.navigate(['/crear-negocio']);
                }
              },
              // antes mandaba a crear-negocio ante cualquier error; ahora lo mostramos
              error: (e) => {
                console.error('[login] error al listar negocios:', e);
                this.error = `No se pudieron cargar tus negocios (error ${e.status})`;
              }
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
