import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NegocioService } from '../../services/NegocioService';
import { NegocioRequest } from '../../models/negocio';

@Component({
  selector: 'app-crear-negocio',
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-negocio.html',
  styleUrl: './crear-negocio.scss',
})
export class CrearNegocio {

  negocio: NegocioRequest = {
    nombreNegocio: '',
    TipoActividad: '',
    capitalInicial: 0
  };

  // el backend no tiene este campo, así que no se envía
  rolPropietario: string = '';

  error: string = '';
  idUsuario: string = '';

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
    this.negocioService.crear(this.negocio).subscribe({
      next: (negocioCreado) => {
        localStorage.setItem('negocio', JSON.stringify(negocioCreado));
        this.router.navigate(['/panel']);
      },
      error: () => this.error = 'Error al crear el negocio'
    });
  }
}