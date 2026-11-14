import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NegocioResponse, ResumenFinanciero } from '../../models/negocio';
import { UsuarioSesion } from '../../models/usuario';
import { NegocioService } from '../../services/NegocioService';
import { UsuarioService } from '../../services/usuarioService';
import { AuthService } from '../../services/AuthService';
import { FormsModule } from '@angular/forms';
import { GraficoService } from '../../services/GraficoService';
import { AnalisisNegocio } from '../analisis-negocio/analisis-negocio';

@Component({
  selector: 'app-panel-negocio',
  imports: [CommonModule, FormsModule, AnalisisNegocio],
  templateUrl: './panel-negocio.html',
  styleUrl: './panel-negocio.scss',
})
export class PanelNegocio implements OnInit {
  negocio: NegocioResponse | null = null;
  usuario: UsuarioSesion | null = null;
  resumen: ResumenFinanciero | null = null;
  anio: number = new Date().getFullYear();
  anios: number[] = [new Date().getFullYear()];

  constructor(
    private router: Router,
    private negocioService: NegocioService,
    private usuarioService: UsuarioService,
    private auth: AuthService,
    private graficoService: GraficoService,
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

    this.graficoService.mensual(id, this.anio).subscribe({
      next: (data) => {
        const t = data.totales;
        this.resumen = {
          totalIngreso: t.ingresos,
          totalEgresos: t.egresos,
          totalGastos: t.gastos,
          utilidad: t.utilidad,
        };
        // Años con movimientos + el año actual, del más nuevo al más viejo
        const set = new Set<number>([...data.aniosDisponibles, new Date().getFullYear()]);
        this.anios = [...set].sort((a, b) => b - a);
        this.cd.detectChanges();
      },
      error: (err) => console.log('Error:', err),
    });
  }
}