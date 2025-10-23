// ==================================================
// Funciones de autenticación y control de sesión
// ==================================================
// Conjunto de utilidades relacionadas con la gestión de roles, autenticación y cierre de sesión.

import { Router } from "@angular/router";
import { AlertTotalService } from "../Service/alert-total.service";
import { lastValueFrom, Observable } from "rxjs";
import { AuthService } from "../Service/Auth/auth.service";

// Verifica si el rol proporcionado corresponde a un administrador
export function isAdminRole(role: string | null | undefined): boolean {
	return (role || '') === 'SM_ACTION';
}

// Ejecuta el proceso de cierre de sesión eliminando el token y redirigiendo al login.
// Puede mostrar una notificación si se provee el servicio de alertas.
export async function performLogout(
  router: Router,
  authService: AuthService,
  alertService?: AlertTotalService
): Promise<void> {
  try {
    await lastValueFrom(authService.logout());

    if (alertService) {
      alertService.toast("Sesión cerrada correctamente", 'success');
    }

    router.navigate(['/Login']);
  } catch (error) {
    if (alertService) {
      alertService.toast("Error al cerrar sesión", 'error');
    }
  }
}

// Variante simplificada de performLogout que no depende de la inyección directa del servicio
export async function performLogoutWithAlert(
  router: Router,
  authService: AuthService
): Promise<void> {
  await performLogout(router, authService);
}

// Convierte Observables de Angular en Promesas nativas para uso en contextos async/await.
// Simplifica la integración entre código reactivo (Observables) y código imperativo (async/await).
export function toPromise<T>(observable: Observable<T>): Promise<T> {
  return lastValueFrom(observable);
}
