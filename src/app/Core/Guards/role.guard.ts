// ==================================================
// Guard: roleGuard
// ==================================================
// Este guard protege rutas según el rol del usuario.
// Permite el acceso solo si el rol actual coincide con alguno de los roles esperados definidos en la ruta.

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Service/Auth/auth.service';
import { catchError, map, of } from 'rxjs';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as Array<string>;

  // Si ya tenemos la información del usuario cacheada
  if (authService.isAuthInitialized() && authService.isAuthenticated()) {
    const userRole = authService.getRole();

    if (!userRole) {
      router.navigate(['/Login']);
      return false;
    }

    if (!expectedRoles || !expectedRoles.includes(userRole)) {
      router.navigate(['/access-denied']);
      return false;
    }

    return true;
  }

  // Si no se ha verificado la autenticación, esperar a que el authGuard complete
  if (!authService.isAuthInitialized()) {
    return authService.checkAuthentication().pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          router.navigate(['/Login']);
          return false;
        }

        const userRole = authService.getRole();
        if (!expectedRoles || !expectedRoles.includes(userRole)) {
          router.navigate(['/access-denied']);
          return false;
        }

        return true;
      }),
      catchError(() => {
        router.navigate(['/Login']);
        return of(false);
      })
    );
  }

  // Si ya se verificó pero no está autenticado
  router.navigate(['/Login']);
  return false;
};
