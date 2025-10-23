import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, lastValueFrom, of, throwError } from 'rxjs';
import { AlertTotalService } from '../../alert-total.service';
import { AuthService } from '../../Auth/auth.service';

export interface DeleteConfig {
	entityName: string; // 'empresa', 'sucursal', etc.
	entityDisplayName: string; // Nombre para mostrar
	deleteService: (id: number, strategy: number) => any; // Servicio de eliminación
	getId: () => Promise<number | null> | number | null; // Función para obtener el ID
	successRedirect?: string; // Ruta de redirección después del éxito
	requirePassword?: boolean; // Si requiere validación de contraseña
}

// ===== SERVICIO DE ELIMINACIÓN CASCADA =====
// Gestiona la eliminación de entidades con validación de credenciales y confirmación por contraseña.
// Este servicio centraliza la lógica de eliminación segura, proporcionando:
//
// - Flujo de confirmación estándar: Dialogo de confirmación + validación opcional de contraseña
// - Validación de identidad: Verificación de credenciales antes de operaciones destructivas
// - Manejo consistente de errores: Gestión unificada de respuestas HTTP y estados de error
// - Redirección post-eliminación: Navegación automática tras operaciones exitosas
//
// CONFIGURACIÓN FLEXIBLE:
// - Soporte para IDs síncronos y asíncronos
// - Estrategias de eliminación parametrizables
// - Redirección condicional post-operación
// - Validación de contraseña opcional por entidad
@Injectable({
	providedIn: 'root'
})
export class KillEdificationService {
	private authService = inject(AuthService);
	private alertService = inject(AlertTotalService);
	private router = inject(Router);

	async confirmAndDelete(config: DeleteConfig): Promise<void> {
		// Confirmación inicial
		const result = await this.alertService.custom({
			title: '¿Estás seguro?',
			html: `
        <p style="font-size: 16px; margin: 15px 0;">
          Esta acción <strong>eliminará permanentemente</strong> la ${config.entityName}:<br>
          <strong>"${config.entityDisplayName}"</strong>
        </p>
        <p style="color: #e53e3e; font-size: 14px;">
          ⚠️ <strong>Advertencia:</strong> Esta acción no se puede deshacer.
        </p>
      `,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			cancelButtonColor: '#6b7280',
			confirmButtonText: `Sí, eliminar ${config.entityName}`,
			cancelButtonText: 'Cancelar',
		});

		if (!result.isConfirmed) return;

		// Validación de contraseña si es requerida
		if (config.requirePassword !== false) {
			await this.validatePasswordAndDelete(config);
		} else {
			await this.executeDelete(config);
		}
	}

	private async validatePasswordAndDelete(config: DeleteConfig): Promise<void> {
		try {
			const passwordResult = await this.alertService.inputPassword(
				'Confirmar eliminación',
				{
					text: `Ingresa tu contraseña para confirmar la eliminación permanente de la ${config.entityName}.`,
					inputPlaceholder: 'Contraseña actual',
					confirmButtonText: 'Confirmar eliminación',
					cancelButtonText: 'Cancelar',
					inputValidator: (value) => {
						if (!value) return 'La contraseña es requerida';
						if (value.length < 4) return 'La contraseña debe tener al menos 4 caracteres';
						return null;
					}
				}
			);

			if (passwordResult.isConfirmed && passwordResult.value) {
				await this.verifyPasswordAndExecute(config, passwordResult.value);
			}
		} catch (error) {
			console.error('Error en validación de contraseña:', error);
		}
	}

	private async verifyPasswordAndExecute(config: DeleteConfig, password: string): Promise<void> {
		try {
			const username = this.authService.getUsername();
			const isValid = await lastValueFrom(
				this.authService.validateLogin({ username, password }).pipe(
					catchError((error: HttpErrorResponse) => {
						if (error.status === 401) return of(false);
						return throwError(() => error);
					})
				)
			);

			if (isValid) {
				await this.executeDelete(config);
			} else {
				await this.alertService.error(
					'Contraseña incorrecta',
					'La contraseña ingresada no es válida. Por favor, intenta nuevamente.'
				);
			}
		} catch (error) {
			if (error instanceof HttpErrorResponse && error.status === 401) {
				await this.alertService.error(
					'Contraseña incorrecta',
					'La contraseña ingresada no es válida. Por favor, intenta nuevamente.'
				);
			} else {
				await this.alertService.error(
					'Error de validación',
					'Ocurrió un error al validar tus credenciales. Por favor, intenta nuevamente.'
				);
			}
		}
	}

	private async executeDelete(config: DeleteConfig): Promise<void> {
		let entityId: number | null;

		// Obtener el ID (puede ser síncrono o asíncrono)
		const idResult = config.getId();
		if (idResult instanceof Promise) {
			entityId = await idResult;
		} else {
			entityId = idResult;
		}

		if (!entityId) {
			await this.alertService.error('Error', `No se encontró la ${config.entityName} a eliminar`);
			return;
		}

		await this.alertService.withLoading(
			async () => {
				await lastValueFrom(config.deleteService(entityId, 2));
			},
			{
				loadingTitle: `Eliminando ${config.entityName}...`,
				loadingText: `Procesando eliminación de la ${config.entityName}`,
				successTitle: `¡${config.entityName} eliminada!`,
				successText: `La ${config.entityName} ha sido eliminada exitosamente`,
				errorTitle: 'Error',
				errorText: `Ocurrió un problema al eliminar la ${config.entityName}`
			}
		);

		if (config.successRedirect) {
			this.router.navigate([config.successRedirect]);
		}
	}
}
