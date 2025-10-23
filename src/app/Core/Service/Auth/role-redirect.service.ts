// ===== SERVICIO DE REDIRECCIÓN POR ROL =====
// Redirige a los usuarios a la ruta correspondiente según su rol. Centraliza
// el mapeo entre roles del sistema y rutas del frontend para mantener orden
// y facilitar cambios futuros.

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RoleRedirectService {

	constructor(private router: Router) { }

	// Diccionario de rutas según rol
	private roleRoutes: Record<string, string> = {
		'SM_ACTION': '/securitymodule',
		'ADMINISTRADOR': '/admin',
		'SUBADMINISTRADOR': '/subadmin',
		'ENCARGADO_ZONA': '/areaManager',

	};

	// Redirige al usuario según su rol, o al login/access-denied si no corresponde
	redirectUser(role: string | null) {
		if (!role) {
			this.router.navigate(['/Login']);
			return;
		}

		const target = this.roleRoutes[role] || '/access-denied';
		this.router.navigate([target]);
	}
}
