// ==================================================
// Guard: authGuard
// ==================================================
// Este guard protege rutas que requieren autenticación.
// Verifica si el usuario ha iniciado sesión y, si no es así, redirige a la ruta raíz.

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../Service/Auth/auth.service';

export const authGuard: CanActivateFn = () => {
	const authService = inject(AuthService);
	const router = inject(Router);

	// Si ya tenemos información cacheada y está autenticado
	if (authService.isAuthInitialized() && authService.isAuthenticated()) {
		return true;
	}

	// Si tenemos cache pero no está autenticado
	if (authService.isAuthInitialized() && !authService.isAuthenticated()) {
		router.navigate(['/Login']);
		return false;
	}

	// Si no se ha verificado, llamar al backend
	return authService.checkAuthentication().pipe(
		map(isAuthenticated => {
			if (isAuthenticated) {
				return true;
			} else {
				router.navigate(['/Login']);
				return false;
			}
		}),
		catchError(() => {
			router.navigate(['/Login']);
			return of(false);
		})
	);
};
