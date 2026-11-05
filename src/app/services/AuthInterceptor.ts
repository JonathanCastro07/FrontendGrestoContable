import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './AuthService';

const RUTAS_PUBLICAS = [
  '/api/usuario/login',
  '/api/usuario/registro',
  '/api/usuario/recuperar'
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const esPublica = RUTAS_PUBLICAS.some(ruta => req.url.includes(ruta));
  if (esPublica) {
    return next(req);
  }

  const token = auth.getToken();

  // Token vencido: no tiene sentido llamar al backend
  if (token && auth.tokenExpirado()) {
    auth.limpiarSesion();
    router.navigate(['/login']);
    return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Sesión expirada', url: req.url }));
  }

  const peticion = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      if (token && error.status === 401) {
        auth.limpiarSesion();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};