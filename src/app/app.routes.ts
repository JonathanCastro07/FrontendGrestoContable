import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { CrearNegocio } from './components/crear-negocio/crear-negocio';
import { PanelNegocio } from './components/panel-negocio/panel-negocio';
import { Movimientos } from './components/movimientos/movimientos';
import { VerMovimientos } from './components/ver-movimientos/ver-movimientos';
import { Configuracion } from './components/configuracion/configuracion';
import { PagosPeriodicos } from './components/pagos-periodicos/pagos-periodicos';
import { authGuard } from './services/AuthGuard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Públicas
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },

  // Protegidas (requieren sesión con token vigente)
  { path: 'crear-negocio', component: CrearNegocio, canActivate: [authGuard] },
  { path: 'panel', component: PanelNegocio, canActivate: [authGuard] },
  { path: 'movimientos', component: Movimientos, canActivate: [authGuard] },
  { path: 'ver-movimientos', component: VerMovimientos, canActivate: [authGuard] },
  { path: 'configuracion', component: Configuracion, canActivate: [authGuard] },
  { path: 'pagos-periodicos', component: PagosPeriodicos, canActivate: [authGuard] },

  { path: '**', redirectTo: 'login' },
];