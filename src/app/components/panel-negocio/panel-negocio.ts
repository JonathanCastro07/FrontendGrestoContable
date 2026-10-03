import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NegocioResponse, ResumenFinanciero } from '../../models/negocio';
import { UsuarioResponse } from '../../models/usuario';
import { NegocioService } from '../../services/NegocioService';
import { UsuarioService } from '../../services/usuarioService';

@Component({
  selector: 'app-panel-negocio',
  imports: [CommonModule, RouterLink],
  templateUrl: './panel-negocio.html',
  styleUrl: './panel-negocio.scss',
})
export class PanelNegocio implements OnInit {
  negocio: NegocioResponse | null = null;
  usuario: UsuarioResponse | null = null;
  resumen: ResumenFinanciero | null = null;

  constructor(
    private router: Router,
    private negocioService: NegocioService,
    private usuarioService: UsuarioService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const dataNegocio = localStorage.getItem('negocio');
    const dataUsuario = localStorage.getItem('usuario');

    if (dataNegocio) {
      this.negocio = JSON.parse(dataNegocio);
      this.cargarResumen();
      this.cd.detectChanges();
    }
    if (dataUsuario) {
      this.usuario = JSON.parse(dataUsuario);
    }

    if (!this.negocio || !this.usuario) {
      this.router.navigate(['/login']);
    }
  }

  cerrarSesion() {
    this.usuarioService.logout().subscribe({
      next: () => {
        localStorage.removeItem('usuario');
        localStorage.removeItem('negocio');
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.removeItem('usuario');
        localStorage.removeItem('negocio');
        this.router.navigate(['/login']);
      },
    });
  }

  cargarResumen() {
    const id = this.negocio?.idNegocio;
    if (!id) return;

    this.negocioService.verResumenFinanciero(id).subscribe({
      next: (data) => {
        this.resumen = data;
        this.cd.detectChanges();
      },
      error: (err) => console.log('Error:', err),
    });
  }
}