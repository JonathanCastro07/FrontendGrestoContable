import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NegocioService } from '../../services/NegocioService';
import { Negocio } from '../../models/negocio';

@Component({
  selector: 'app-negocios',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './negocios.html',
  styleUrl: './negocios.scss',
})
export class Negocios implements OnInit {

  negocios: Negocio[] = [];
  nuevoNegocio: Negocio = {
    nombreNegocio: '',
    tipoActividad: '',
    capitalInicial: 0
  };

  error: string = '';
  exito: string = '';
  mostrarFormulario: boolean = false;

  idUsuario: number = 0;

  constructor(private negocioService: NegocioService) {}

  ngOnInit() {
    const data = localStorage.getItem('usuario');
    if (data) {
      const usuario = JSON.parse(data);
      this.idUsuario = usuario.idUsuario;
      this.cargarNegocios();
    }
  }

tieneNegocio: boolean = false;

cargarNegocios() {
  this.negocioService.listarPorUsuario(this.idUsuario).subscribe({
    next: (data) => {
      this.negocios = data;
      this.tieneNegocio = data.length > 0;
    },
    error: () => this.error = 'Error al cargar los negocios'
  });
}

crear() {
  this.nuevoNegocio.usuario = { idUsuario: this.idUsuario, nombre: '', correo: '', password: '' };
  this.negocioService.crear(this.nuevoNegocio).subscribe({
    next: () => {
      this.exito = 'Negocio creado exitosamente';
      this.mostrarFormulario = false;
      this.nuevoNegocio = { nombreNegocio: '', tipoActividad: '', capitalInicial: 0 };
      setTimeout(() => this.cargarNegocios(), 500); // ← agrega el delay
    },
    error: () => this.error = 'Error al crear el negocio'
  });
}

eliminar(id: number | undefined) {
  if (!id) return;
  this.negocioService.eliminar(id).subscribe({
    next: () => this.cargarNegocios(),
    error: () => this.error = 'Error al eliminar el negocio'
  });
}
}