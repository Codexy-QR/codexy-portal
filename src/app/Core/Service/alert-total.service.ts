// ===== SERVICIO DE ALERTAS Y NOTIFICACIONES =====
// Servicio centralizado que gestiona todas las alertas, confirmaciones, toasts, prompts e inputs
// de la aplicación usando SweetAlert2. Permite unificar la experiencia del usuario, simplificar
// el manejo de mensajes y reducir la duplicación de lógica en componentes o servicios.

import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult, SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';
import { getPasswordDialogHTML } from '../Constants/password-dialog-html';

// Interfaces principales del componente
export interface BasicAlertOptions {
	title?: string;
	text?: string;
	html?: string;
	icon?: SweetAlertIcon;
	confirmButtonText?: string;
	cancelButtonText?: string;
	confirmButtonColor?: string;
	cancelButtonColor?: string;
	showCancelButton?: boolean;
	allowOutsideClick?: boolean;
	timer?: number;
	timerProgressBar?: boolean;
}

export interface LoadingOptions {
	loadingTitle?: string;
	loadingText?: string;
	successTitle?: string;
	successText?: string;
	errorTitle?: string;
	errorText?: string;
	showSuccessAlert?: boolean;
}

export interface ConfirmationOptions extends LoadingOptions {
	questionTitle?: string;
	questionText?: string;
	confirmText?: string;
	cancelText?: string;
	icon?: SweetAlertIcon;
}

@Injectable({
	providedIn: 'root'
})
export class AlertTotalService {

	// ----- ALERTAS BÁSICAS -----
	// Muestra alertas simples de éxito, error, información o advertencia
	success(title: string, text: string = ''): Promise<SweetAlertResult<any>> {
		return Swal.fire({
			title,
			text,
			icon: 'success',
			confirmButtonText: 'Aceptar'
		});
	}

	error(title: string, text: string = ''): Promise<SweetAlertResult<any>> {
		return Swal.fire({
			title,
			text,
			icon: 'error',
			confirmButtonText: 'Aceptar'
		});
	}

	info(title: string, text: string = ''): Promise<SweetAlertResult<any>> {
		return Swal.fire({
			title,
			text,
			icon: 'info',
			confirmButtonText: 'Aceptar'
		});
	}

	warning(title: string, text: string = ''): Promise<SweetAlertResult<any>> {
		return Swal.fire({
			title,
			text,
			icon: 'warning',
			confirmButtonText: 'Aceptar'
		});
	}



	// ----- ALERTAS PERSONALIZADAS -----
	// Permite crear alertas personalizadas con opciones avanzadas
	custom(options: BasicAlertOptions): Promise<SweetAlertResult<any>> {
		// Usar directamente las opciones de SweetAlert2 para evitar conflictos de tipo
		const swalOptions: SweetAlertOptions = {
			confirmButtonText: 'Aceptar',
			allowOutsideClick: true,
			...options as any // Cast temporal para evitar problemas de tipado
		};

		return Swal.fire(swalOptions);
	}



	// ----- ALERTAS CON INPUT -----
	// Muestra un cuadro de texto para entrada de datos
	inputText(
		title: string,
		options: {
			text?: string;
			inputPlaceholder?: string;
			inputValue?: string;
			confirmButtonText?: string;
			cancelButtonText?: string;
			showCancelButton?: boolean;
			inputValidator?: (value: string) => string | null;
		} = {}
	): Promise<SweetAlertResult<any>> {

		const swalOptions: SweetAlertOptions = {
			title,
			input: 'text',
			showCancelButton: true,
			confirmButtonText: 'Aceptar',
			cancelButtonText: 'Cancelar',
			inputValidator: (value: string) => {
				if (options.inputValidator) {
					return options.inputValidator(value);
				}
				if (!value) {
					return 'Este campo es requerido';
				}
				return null;
			},
			...options
		};

		return Swal.fire(swalOptions);
	}

	// Solicita correo con validación
	inputEmail(
		title: string,
		options: {
			text?: string;
			inputPlaceholder?: string;
			confirmButtonText?: string;
			cancelButtonText?: string;
			showCancelButton?: boolean;
		} = {}
	): Promise<SweetAlertResult<any>> {

		const swalOptions: SweetAlertOptions = {
			title,
			input: 'email',
			inputPlaceholder: 'correo@ejemplo.com',
			showCancelButton: true,
			confirmButtonText: 'Aceptar',
			cancelButtonText: 'Cancelar',
			inputValidator: (value: string) => {
				if (!value) {
					return 'Por favor ingresa tu correo';
				}
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(value)) {
					return 'Ingresa un correo electrónico válido';
				}
				return null;
			},
			...options
		};

		return Swal.fire(swalOptions);
	}

	// Solicita contraseña con validación personalizada
	inputPassword(
		title: string,
		options: {
			text?: string;
			inputPlaceholder?: string;
			confirmButtonText?: string;
			cancelButtonText?: string;
			showCancelButton?: boolean;
			inputValidator?: (value: string) => string | null;
		} = {}
	): Promise<SweetAlertResult<any>> {

		const swalOptions: SweetAlertOptions = {
			title,
			html: getPasswordDialogHTML(options),
			showCancelButton: options.showCancelButton !== false,
			confirmButtonText: options.confirmButtonText || 'Aceptar',
			cancelButtonText: options.cancelButtonText || 'Cancelar',
			didOpen: () => {
				const passwordInput = document.getElementById('swal-password-input') as HTMLInputElement;
				const toggleButton = document.getElementById('swal-toggle-password') as HTMLButtonElement;

				toggleButton.addEventListener('click', () => {
					const isPassword = passwordInput.type === 'password';
					passwordInput.type = isPassword ? 'text' : 'password';
					toggleButton.textContent = isPassword ? 'visibility_off' : 'visibility';
				});

				setTimeout(() => passwordInput.focus(), 100);
			},
			preConfirm: () => {
				const passwordInput = document.getElementById('swal-password-input') as HTMLInputElement;
				const value = passwordInput.value;

				if (options.inputValidator) {
					const validationResult = options.inputValidator(value);
					if (validationResult) {
						Swal.showValidationMessage(validationResult);
						return false;
					}
				} else if (!value) {
					Swal.showValidationMessage('Este campo es requerido');
					return false;
				}

				return value;
			},
			...options
		};

		return Swal.fire(swalOptions);
	}

	// Solicita texto en formato de área extensa
	inputTextarea(
		title: string,
		options: {
			text?: string;
			inputPlaceholder?: string;
			confirmButtonText?: string;
			cancelButtonText?: string;
			showCancelButton?: boolean;
			inputValidator?: (value: string) => string | null;
		} = {}
	): Promise<SweetAlertResult<any>> {

		const swalOptions: SweetAlertOptions = {
			title,
			input: 'textarea',
			inputPlaceholder: 'Escribe aquí...',
			showCancelButton: true,
			confirmButtonText: 'Aceptar',
			cancelButtonText: 'Cancelar',
			inputValidator: options.inputValidator || ((value: string) => {
				if (!value) {
					return 'Este campo es requerido';
				}
				return null;
			}),
			...options
		};

		return Swal.fire(swalOptions);
	}

	// Solicita selección desde un listado de opciones
	inputSelect(
		title: string,
		selectOptions: Record<string, string>,
		options: {
			text?: string;
			confirmButtonText?: string;
			cancelButtonText?: string;
			showCancelButton?: boolean;
			inputValidator?: (value: string) => string | null;
		} = {}
	): Promise<SweetAlertResult<any>> {

		const swalOptions: SweetAlertOptions = {
			title,
			input: 'select',
			inputOptions: selectOptions,
			showCancelButton: true,
			confirmButtonText: 'Aceptar',
			cancelButtonText: 'Cancelar',
			inputValidator: options.inputValidator || ((value: string) => {
				if (!value) {
					return 'Por favor selecciona una opción';
				}
				return null;
			}),
			...options
		};

		return Swal.fire(swalOptions);
	}



	// ----- ALERTAS ESPECIFICAS -----
	// Prompt para recuperar contraseña con email
	promptForgotPassword(): Promise<SweetAlertResult<any>> {
		return this.inputEmail('Recuperar contraseña', {
			text: 'Ingresa tu correo electrónico para recibir instrucciones',
			confirmButtonText: 'Enviar',
			cancelButtonText: 'Cancelar'
		});
	}

	// Prompt para cambio de contraseña
	promptChangePassword(): Promise<SweetAlertResult<any>> {
		return this.inputPassword('Nueva contraseña', {
			text: 'Ingresa tu nueva contraseña',
			confirmButtonText: 'Cambiar',
			cancelButtonText: 'Cancelar',
			inputValidator: (value) => {
				if (!value || value.length < 6) {
					return 'La contraseña debe tener al menos 6 caracteres';
				}
				return null;
			}
		});
	}



	// ----- CONFIRMACIONES -----
	// Muestra una confirmación simple con botones de aceptar/cancelar
	confirm(
		title: string,
		text: string = '',
		confirmText: string = 'Sí, continuar',
		cancelText: string = 'Cancelar'
	): Promise<SweetAlertResult<any>> {
		return Swal.fire({
			title,
			text,
			icon: 'question',
			showCancelButton: true,
			confirmButtonText: confirmText,
			cancelButtonText: cancelText,
			reverseButtons: true
		});
	}

	// Confirmación específica para cierre de sesión
	confirmLogout(): Promise<SweetAlertResult<any>> {
		return Swal.fire({
			title: '¿Deseas cerrar sesión?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, Cerrar Sesión',
			confirmButtonColor: '#d33',
			cancelButtonText: 'No, Quedarme',
			reverseButtons: true
		});
	}

	// Confirmación para eliminación de recursos
	confirmDestroy(
		title: string = '¿Estás seguro?',
		text: string = 'Esta acción no se puede deshacer',
		confirmText: string = 'Sí, eliminar'
	): Promise<SweetAlertResult<any>> {
		return Swal.fire({
			title,
			text,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: confirmText,
			cancelButtonText: 'Cancelar',
			confirmButtonColor: '#d33',
			cancelButtonColor: '#3085d6',
			reverseButtons: true
		});
	}



	// ----- ALERTAS CON CARGA Y PROGRESO -----
	// Muestra un loader bloqueante mientras se procesa una acción
	showLoading(title: string = 'Procesando...', text: string = 'Por favor espera un momento'): void {
		Swal.fire({
			title,
			text,
			allowOutsideClick: false,
			allowEscapeKey: false,
			showConfirmButton: false,
			didOpen: () => {
				Swal.showLoading();
			}
		});
	}

	// Cierra cualquier alerta activa
	close(): void {
		Swal.close();
	}

	// Ejecuta una promesa mostrando loader, manejo de errores y feedback automático
	async withLoading<T>(
		action: () => Promise<T>,
		options: LoadingOptions = {}
	): Promise<T> {
		const {
			loadingTitle = 'Procesando...',
			loadingText = 'Por favor espera un momento',
			successTitle = '¡Éxito!',
			successText = 'Operación completada correctamente',
			errorTitle = 'Error',
			errorText = 'Ocurrió un error inesperado',
			showSuccessAlert = true
		} = options;

		this.showLoading(loadingTitle, loadingText);

		try {
			const result = await action();

			this.close();

			if (showSuccessAlert && (successTitle || successText)) {
				await this.success(successTitle, successText);
			}

			return result;
		} catch (error: any) {
			this.close();

			const errorMessage = this.extractErrorMessage(error, errorText);

			await this.error(errorTitle, errorMessage);

			throw error; // Re-lanza el error para que el componente pueda manejarlo si es necesario
		}
	}

	// Ejecuta una promesa con confirmación previa y loader
	async confirmWithLoading<T>(
		action: () => Promise<T>,
		options: ConfirmationOptions = {}
	): Promise<T | null> {
		const {
			questionTitle = '¿Confirmar acción?',
			questionText = '¿Estás seguro de que deseas continuar?',
			confirmText = 'Sí, continuar',
			cancelText = 'Cancelar',
			icon = 'question',
			loadingTitle = 'Procesando...',
			loadingText = 'Por favor espera un momento',
			successTitle = '¡Éxito!',
			successText = 'Operación completada correctamente',
			errorTitle = 'Error',
			errorText = 'Ocurrió un error inesperado',
			showSuccessAlert = true
		} = options;

		const confirmResult = await Swal.fire({
			title: questionTitle,
			text: questionText,
			icon,
			showCancelButton: true,
			confirmButtonText: confirmText,
			cancelButtonText: cancelText,
			reverseButtons: true
		});

		if (confirmResult.isConfirmed) {
			return await this.withLoading(action, {
				loadingTitle,
				loadingText,
				successTitle,
				successText,
				errorTitle,
				errorText,
				showSuccessAlert
			});
		}

		return null; // Usuario canceló la acción
	}

	// Ejecuta una promesa con confirmación de eliminación y loader
	async confirmDestroyWithLoading<T>(
		action: () => Promise<T>,
		options: Partial<ConfirmationOptions & {
			destroyTitle?: string;
			destroyText?: string;
			destroyConfirmText?: string;
		}> = {}
	): Promise<T | null> {
		const {
			destroyTitle = '¿Estás seguro?',
			destroyText = 'Esta acción no se puede deshacer',
			destroyConfirmText = 'Sí, eliminar',
			...restOptions
		} = options;

		return this.confirmWithLoading(action, {
			questionTitle: destroyTitle,
			questionText: destroyText,
			confirmText: destroyConfirmText,
			cancelText: 'Cancelar',
			icon: 'warning',
			successTitle: '¡Eliminado!',
			successText: 'El elemento ha sido eliminado correctamente',
			...restOptions
		});
	}



	// ----- TOASTS Y ALERTAS TEMPORIZADAS -----
	// Muestra un toast no intrusivo en pantalla
	toast(
		title: string,
		icon: SweetAlertIcon = 'success',
		position: any = 'top-end',
		timer: number = 3000
	): void {
		const Toast = Swal.mixin({
			toast: true,
			position,
			showConfirmButton: false,
			timer,
			timerProgressBar: true,
			didOpen: (toast) => {
				toast.addEventListener('mouseenter', Swal.stopTimer)
				toast.addEventListener('mouseleave', Swal.resumeTimer)
			}
		});

		Toast.fire({
			icon,
			title
		});
	}

	// Muestra una alerta que se cierra automáticamente tras unos segundos
	timedAlert(
		title: string,
		text: string = '',
		icon: SweetAlertIcon = 'info',
		timer: number = 2000
	): Promise<SweetAlertResult<any>> {
		return Swal.fire({
			title,
			text,
			icon,
			timer,
			showConfirmButton: false,
			timerProgressBar: true
		});
	}



	// ----- ALERTAS CON INPUT VALIDADO -----
	// Solicita texto de confirmación para continuar con una acción crítica
	async confirmWithInput(
		title: string,
		inputLabel: string,
		expectedValue: string,
		options: {
			confirmButtonText?: string;
			cancelButtonText?: string;
		} = {}
	): Promise<boolean> {
		const result = await this.inputText(title, {
			text: inputLabel,
			inputValidator: (value) => {
				if (value !== expectedValue) {
					return `Debes escribir exactamente: ${expectedValue}`;
				}
				return null;
			},
			confirmButtonText: options.confirmButtonText || 'Confirmar',
			cancelButtonText: options.cancelButtonText || 'Cancelar'
		});

		return result.isConfirmed && result.value === expectedValue;
	}

	// Muestra una alerta de progreso para operaciones largas
	showProgress(title: string = 'Procesando...', text: string = 'Operación en progreso'): void {
		Swal.fire({
			title,
			text,
			allowOutsideClick: false,
			allowEscapeKey: false,
			showConfirmButton: false,
			didOpen: () => {
				const progressBar = Swal.getHtmlContainer()?.querySelector('.swal2-progress-bar');
				if (progressBar) {
					(progressBar as HTMLElement).style.display = 'block';
				}
			}
		});
	}

	// Actualiza dinámicamente el progreso mostrado en la alerta
	updateProgress(percentage: number, text?: string): void {
		if (text) {
			Swal.update({ text });
		}

		const progressBar = Swal.getHtmlContainer()?.querySelector('.swal2-progress-bar');
		if (progressBar) {
			(progressBar as HTMLElement).style.width = `${percentage}%`;
		}
	}



	// ===== UTILITARIOS PARA MANEJO DE ERRORES =====
	private extractErrorMessage(error: any, defaultMessage: string = 'Ocurrió un error inesperado'): string {
		// Mensaje explícito del backend
		if (error?.error?.message) {
			return error.error.message;
		}

		// Si error.error viene como string plano
		if (typeof error?.error === 'string') {
			return error.error;
		}

		if (error?.error?.error) {
			const errorMessage = error.error.error;
			const cleanMessage = errorMessage.split(':')[1]?.trim();
			return cleanMessage || errorMessage;
		}

		// Si viene como HttpErrorResponse genérico de Angular
		if (error?.message) {
			return error.message;
		}

		if (typeof error === 'string') {
			return error;
		}

		if (error?.error?.errors && Array.isArray(error.error.errors)) {
			return error.error.errors.join(', ');
		}

		return defaultMessage;
	}
}
