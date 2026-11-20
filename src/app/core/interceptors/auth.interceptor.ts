import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  let token: string | null = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    token = localStorage.getItem('optica_luxe_admin_token');
  }

  let authReq = req;
  if (token && req.url.includes('/api/')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && req.url.includes('/api/') && !req.url.includes('/api/auth/login')) {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('optica_luxe_admin_token');
          localStorage.removeItem('optica_luxe_admin_user');
        }
        router.navigate(['/admin/login']);
      }
      return throwError(() => error);
    })
  );
};
