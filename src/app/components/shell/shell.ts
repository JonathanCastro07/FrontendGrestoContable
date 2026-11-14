import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../services/AuthService';
import { UsuarioService } from '../../services/usuarioService';
import { NotificacionService } from '../../services/NotificacionService';
import { NegocioResponse } from '../../models/negocio';
import { UsuarioSesion } from '../../models/usuario';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell implements OnInit, OnDestroy {
  negocio: NegocioResponse | null = null;
  usuario: UsuarioSesion | null = null;
  menuAbierto = false;
  notifAbierto = false;

  private sub?: Subscription;
  private timer?: ReturnType<typeof setInterval>;

  constructor(
    private router: Router,
    private auth: AuthService,
    private usuarioService: UsuarioService,
    public notif: NotificacionService
  ) {
    this.negocio = this.auth.getNegocio();
    this.usuario = this.auth.getUsuario();
  }

  ngOnInit() {
    this.notif.refrescar();
    // Se revisa al cambiar de pantalla (así se actualiza al crear/editar un pago) y cada 5 minutos
    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.notif.refrescar());
    this.timer = setInterval(() => this.notif.refrescar(), 5 * 60 * 1000);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    if (this.timer) clearInterval(this.timer);
  }

  get inicial(): string {
    return (this.usuario?.nombre ?? '?').trim().charAt(0).toUpperCase();
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  alternarNotif() {
    this.notifAbierto = !this.notifAbierto;
    if (this.notifAbierto) this.notif.marcarLeidas();
  }

  cerrarSesion() {
    // Invalida el token en el backend (lista negra en Redis) y limpia la sesión local
    const salir = () => {
      this.auth.limpiarSesion();
      this.router.navigate(['/login']);
    };
    this.usuarioService.logout().subscribe({ next: salir, error: salir });
  }
}