import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { CrearNegocio } from './components/crear-negocio/crear-negocio';
import { PanelNegocio } from './components/panel-negocio/panel-negocio';
import { Movimientos } from './components/movimientos/movimientos';
import { VerMovimientos } from './components/ver-movimientos/ver-movimientos';
import { Configuracion } from './components/configuracion/configuracion';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'crear-negocio', component: CrearNegocio },
  { path: 'panel', component: PanelNegocio },
  { path: 'movimientos', component: Movimientos },
  { path: 'ver-movimientos', component: VerMovimientos },
  { path: 'configuracion', component: Configuracion },
];