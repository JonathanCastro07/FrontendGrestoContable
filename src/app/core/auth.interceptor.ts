import { HttpInterceptorFn } from '@angular/common/http';

const RUTAS_PUBLICAS = ['/usuario/login', '/usuario/registro'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (!token || RUTAS_PUBLICAS.some((ruta) => req.url.includes(ruta))) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};