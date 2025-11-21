import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Variáveis para controle do refresh token
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Adiciona token às requisições (exceto login e refresh)
  if (!req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
    const authReq = adicionarToken(req, authService);
    return next(authReq).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return tratarErro401(authReq, next, authService);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};

// Função para adicionar token à requisição
const adicionarToken = (request: HttpRequest<unknown>, authService: AuthService): HttpRequest<unknown> => {
  const token = authService.getAccessToken();
  if (token) {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
  }
  return request;
};

// Função para tratar erro 401 (token expirado)
const tratarErro401 = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<any> => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshTokens().pipe(
      switchMap((response: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.access_token);

        // Repete a requisição original com o novo token
        return next(adicionarToken(request, authService));
      }),
      catchError((error) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => error);
      })
    );
  } else {
    // Se já está atualizando, espera até ter o novo token
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(token => {
        return next(adicionarToken(request, authService));
      })
    );
  }
};
