// ==================================================
// Directiva: LogoutButtonDirective
// ==================================================
// Esta directiva agrega comportamiento de cierre de sesión al elemento sobre el cual se aplica.
// Al hacer clic, muestra una alerta de confirmación y ejecuta el cierre de sesión si el usuario lo confirma.

import { Directive, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AlertTotalService } from '../Service/alert-total.service';
import { AuthService } from '../Service/Auth/auth.service';

@Directive({
	selector: '[appLogoutButton]',
	standalone: true
})
export class LogoutButtonDirective {

	// Inyección de servicios propios del proyecto
	private readonly alertService = inject(AlertTotalService);
	private readonly authService = inject(AuthService);

	// Inyección de servicios nativos de Angular
	private readonly router = inject(Router);

	// Evento host: escucha el clic en el elemento y gestiona el proceso de cierre de sesión
	@HostListener('click')
	async onClick(): Promise<void> {
		const result = await this.alertService.confirmLogout();
		if (result.isConfirmed) {
			try {
				await lastValueFrom(this.authService.logout());
				this.alertService.toast("Sesión cerrada correctamente", 'success');
				this.router.navigate(['/Login']);
			} catch (error) {
				this.alertService.toast("Error al cerrar sesión", 'error');
			}
		}
	}
}
