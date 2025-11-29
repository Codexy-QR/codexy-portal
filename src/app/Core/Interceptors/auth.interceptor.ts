// ==================================================
// Interceptor: authInterceptor
// ==================================================
// Este interceptor agrega el token de autenticación a todas las solicitudes HTTP salientes.
// Si el usuario tiene un token válido, se incluye en el encabezado `Authorization` para
// permitir el acceso a rutas protegidas en el backend.

import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../Service/Auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
	const authService = inject(AuthService);
	const router = inject(Router);

	if (req.url.includes('/api/Auth/') && !req.url.includes('/api/Auth/Refresh')) {
		return next(req.clone({ withCredentials: true }));
	}

	const clonedReq = req.clone({
		withCredentials: true
	});

	return next(clonedReq).pipe(
		catchError((error: HttpErrorResponse) => {
			if (error.status === 401) {
				// EVITAR ciclo infinito en requests de auth
				if (req.url.includes('/api/Auth/Me')) {
					console.log('Request /Me con 401 - No intentar refresh');
					return throwError(() => error);
				}

				return handle401Error(req, next, authService, router);
			}
			return throwError(() => error);
		})
	);
};

// FUNCIÓN PARA MANEJAR ERROR 401 CON REFRESH TOKEN
function handle401Error(
	req: HttpRequest<any>,
	next: HttpHandlerFn,
	authService: AuthService,
	router: Router
) {
	// EVITAR múltiples intentos de refresh
	if (authService.isRefreshInProgress()) {
		return authService.getRefreshObservable().pipe(
			filter(request => request !== null),
			take(1),
			switchMap((pendingRequest) => {
				const retryReq = pendingRequest.clone({
					withCredentials: true
				});
				return next(retryReq);
			})
		);
	}

	// Intentar refresh solo una vez
	authService.addPendingRequest(req);

	return authService.refreshToken().pipe(
		switchMap(() => {
			const retryReq = req.clone({
				withCredentials: true
			});
			return next(retryReq);
		}),
		catchError((refreshError) => {
			console.log('Refresh token falló - Limpiando estado');
			authService.clearAuthState();

			// SOLO redirigir si no es una request de inicialización
			if (!req.url.includes('/api/Auth/Me')) {
				router.navigate(['/Login']);
			}

			return throwError(() => refreshError);
		})
	);
}
