import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NegocioService } from '../../services/NegocioService';
import { AuthService } from '../../services/AuthService';
import { NegocioRequest, NegocioResponse } from '../../models/negocio';

@Component({
  selector: 'app-negocios',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './negocios.html',
  styleUrl: './negocios.scss',
})
export class Negocios implements OnInit {
  negocios: NegocioResponse[] = [];
  nuevoNegocio: NegocioRequest = {
    nombreNegocio: '',
    TipoActividad: '',
    capitalInicial: 0,
  };

  error: string = '';
  exito: string = '';
  mostrarFormulario: boolean = false;
  tieneNegocio: boolean = false;

  constructor(
    private negocioService: NegocioService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarNegocios();
  }

  cargarNegocios() {
    this.negocioService.misNegocios().subscribe({
      next: (data) => {
        this.negocios = data;
        this.tieneNegocio = data.length > 0;
      },
      error: () => {
        this.error = 'Error al cargar los negocios';
      },
    });
  }

  crear() {
    this.negocioService.crear(this.nuevoNegocio).subscribe({
      next: () => {
        this.exito = 'Negocio creado exitosamente';
        this.mostrarFormulario = false;
        this.nuevoNegocio = {
          nombreNegocio: '',
          TipoActividad: '',
          capitalInicial: 0,
        };
        this.cargarNegocios();
      },
      error: () => {
        this.error = 'Error al crear el negocio';
      },
    });
  }

  eliminar(id: string | undefined) {
    if (!id) return;

    // El usuario va embebido en el negocio: si es su único negocio, se pierde también la cuenta
    const esUnico = this.negocios.length === 1;
    const aviso = esUnico
      ? 'Este es tu único negocio. Si lo eliminas también se elimina tu cuenta. ¿Continuar?'
      : '¿Seguro que quieres eliminar este negocio?';
    if (!confirm(aviso)) return;

    this.negocioService.eliminar(id).subscribe({
      next: () => {
        if (esUnico) {
          this.auth.limpiarSesion();
          this.router.navigate(['/login']);
        } else {
          this.cargarNegocios();
        }
      },
      error: () => {
        this.error = 'Error al eliminar el negocio';
      },
    });
  }
}