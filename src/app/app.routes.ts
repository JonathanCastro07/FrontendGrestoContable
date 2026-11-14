import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { CrearNegocio } from './components/crear-negocio/crear-negocio';
import { PanelNegocio } from './components/panel-negocio/panel-negocio';
import { Movimientos } from './components/movimientos/movimientos';
import { VerMovimientos } from './components/ver-movimientos/ver-movimientos';
import { Configuracion } from './components/configuracion/configuracion';
import { PagosPeriodicos } from './components/pagos-periodicos/pagos-periodicos';
import { Graficos } from './components/graficos/graficos';
import { AnalisisIa } from './components/analisis-ia/analisis-ia';
import { ReporteMensual } from './components/reporte-mensual/reporte-mensual';
import { authGuard } from './services/AuthGuard';
import { Shell } from './components/shell/shell';



export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Públicas
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },

  // Protegidas (requieren sesión con token vigente)
  // Flujo previo: crear el primer negocio (sin menú lateral)
  { path: 'crear-negocio', component: CrearNegocio, canActivate: [authGuard] },

  // Protegidas, dentro del layout con menú lateral
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: 'panel', component: PanelNegocio },
      { path: 'movimientos', component: Movimientos },
      { path: 'ver-movimientos', component: VerMovimientos },
      { path: 'pagos-periodicos', component: PagosPeriodicos },
      { path: 'graficos', component: Graficos },
      { path: 'analisis-ia', component: AnalisisIa },
      { path: 'reporte-mensual', component: ReporteMensual },
      { path: 'configuracion', component: Configuracion },
    ],
  },
  { path: '**', redirectTo: 'login' },
];