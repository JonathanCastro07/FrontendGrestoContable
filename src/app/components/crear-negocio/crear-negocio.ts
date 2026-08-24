import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NegocioService } from '../../services/NegocioService';
import { Negocio } from '../../models/negocio';

@Component({
  selector: 'app-crear-negocio',
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-negocio.html',
  styleUrl: './crear-negocio.scss',
})
export class CrearNegocio {

  negocio: Negocio = {
    nombreNegocio: '',
    tipoActividad: '',
    capitalInicial: 0,
    rolPropietario: ''
  };

  error: string = '';
  idUsuario: number = 0;

  constructor(
    private negocioService: NegocioService,
    private router: Router
  ) {
    const data = localStorage.getItem('usuario');
    if (data) {
      const usuario = JSON.parse(data);
      this.idUsuario = usuario.idUsuario;
    }
  }

  crear() {
    this.negocio.usuario = { 
      idUsuario: this.idUsuario, 
      nombre: '', 
      correo: '', 
      password: '' 
    };
    this.negocioService.crear(this.negocio).subscribe({
      next: (negocioCreado) => {
        localStorage.setItem('negocio', JSON.stringify(negocioCreado));
        this.router.navigate(['/panel']);
      },
      error: () => this.error = 'Error al crear el negocio'
    });
  }
}