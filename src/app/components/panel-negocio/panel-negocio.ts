import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NegocioResponse, ResumenFinanciero } from '../../models/negocio';
import { UsuarioSesion } from '../../models/usuario';
import { NegocioService } from '../../services/NegocioService';
import { UsuarioService } from '../../services/usuarioService';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-panel-negocio',
  imports: [CommonModule, RouterLink],
  templateUrl: './panel-negocio.html',
  styleUrl: './panel-negocio.scss',
})
export class PanelNegocio implements OnInit {
  negocio: NegocioResponse | null = null;
  usuario: UsuarioSesion | null = null;
  resumen: ResumenFinanciero | null = null;

  constructor(
    private router: Router,
    private negocioService: NegocioService,
    private usuarioService: UsuarioService,
    private auth: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.negocio = this.auth.getNegocio();
    this.usuario = this.auth.getUsuario();

    if (!this.negocio || !this.usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarResumen();
    this.cd.detectChanges();
  }

  cerrarSesion() {
    // Invalida el token en el backend (lista negra en Redis) y limpia la sesión local
    const salir = () => {
      this.auth.limpiarSesion();
      this.router.navigate(['/login']);
    };
    this.usuarioService.logout().subscribe({ next: salir, error: salir });
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