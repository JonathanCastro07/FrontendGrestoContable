import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuarioService';
import { CommonModule } from '@angular/common';
import { RegistroRequest } from '../../models/usuario';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  registro: RegistroRequest = {
    nombre: '',
    correo: '',
    password: '',
    preguntaSeguridad: '',
  };

  error: string = '';
  exito: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  registrar() {
    this.usuarioService.registrar(this.registro).subscribe({
      next: () => {
        this.exito = 'Usuario registrado exitosamente';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: () => {
        this.error = 'El correo ya está registrado';
      },
    });
  }
}