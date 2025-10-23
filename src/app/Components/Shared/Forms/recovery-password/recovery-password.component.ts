import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertTotalService } from '../../../../Core/Service/alert-total.service';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';
import { performLogout } from '../../../../Core/Utils/auth.utils';
import { InitialHeaderComponent } from '../../../System/Landing/initial-header/initial-navbar.component';

@Component({
	selector: 'app-recovery-password',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatIconModule,
		MatButtonModule,
		InitialHeaderComponent
	],
	templateUrl: './recovery-password.component.html',
	styleUrl: './recovery-password.component.css'
})
export class RecoveryPasswordComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService)
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly fb = inject(FormBuilder)
	private readonly router = inject(Router)
	private readonly route = inject(ActivatedRoute)

	// Variables de estado y control local
	isSidebarExpanded: boolean = false;
	isSubmitting: boolean = false;
	userEmail: string = '';
	showNewPassword: boolean = false;
	showConfirmPassword: boolean = false;
	private token: string = '';

	// Formulario reactivo del componente
	recoveryForm!: FormGroup;

	// Métodos del ciclo de vida del componente
	ngOnInit(): void {
		// Inicializar formulario
		this.recoveryForm = this.fb.group({
			newPassword: ['', [
				Validators.required,
				Validators.minLength(8),
				this.passwordValidator
			]],
			confirmPassword: ['', [Validators.required]]
		}, { validators: this.passwordMatchValidator });

		// Obtener token desde query param
		this.route.queryParams.subscribe(params => {
			this.token = params['token'] || '';
			if (this.token) {
				this.validateToken();
			} else {
				this.alertService.error(
					'Token no proporcionado'
				);
				this.router.navigate(['Login']);
			}
		});
	}

	// Validar token en backend
	private validateToken(): void {
		this.authService.validateRecoveryToken(this.token).subscribe({
			next: (res) => {
				if (res.valid) {
					this.userEmail = res.email;
				} else {
					this.alertService.error(
						'Enlace inválido',
						'El enlace de recuperación no es válido o ha expirado.'
					).then(() => {
						this.router.navigate(['/Login']);
					});
				}
			},
			error: (e) => {
				console.log("Error al validar el enlace de recuperación.", e);

				// 🔄 MEJORA: Mostrar error específico antes de navegar
				this.alertService.error(
					'Error de validación',
					'No se pudo validar el enlace de recuperación. Serás redirigido al login.'
				).then(() => {
					this.router.navigate(['/Login']);
				});
			}
		});
	}

	// Validador personalizado para la contraseña
	private passwordValidator(control: AbstractControl): ValidationErrors | null {
		const value = control.value;

		if (!value) return null;

		const hasUpperCase = /[A-Z]/.test(value);
		const hasLowerCase = /[a-z]/.test(value);
		const hasNumber = /[0-9]/.test(value);
		const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

		const errors: ValidationErrors = {};

		if (!hasUpperCase) errors['missingUpperCase'] = true;
		if (!hasLowerCase) errors['missingLowerCase'] = true;
		if (!hasNumber) errors['missingNumber'] = true;
		if (!hasSpecialChar) errors['missingSpecialChar'] = true;

		return Object.keys(errors).length > 0 ? errors : null;
	}

	// Validador para confirmar que las contraseñas coincidan
	private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
		const password = control.get('newPassword');
		const confirmPassword = control.get('confirmPassword');

		return password && confirmPassword && password.value !== confirmPassword.value
			? { 'passwordsMismatch': true }
			: null;
	}

	// Métodos auxiliares para mostrar requisitos cumplidos
	hasMinLength(): boolean {
		const password = this.recoveryForm.get('newPassword')?.value;
		return password && password.length >= 8;
	}

	hasUpperCase(): boolean {
		const password = this.recoveryForm.get('newPassword')?.value;
		return password && /[A-Z]/.test(password);
	}

	hasLowerCase(): boolean {
		const password = this.recoveryForm.get('newPassword')?.value;
		return password && /[a-z]/.test(password);
	}

	hasNumber(): boolean {
		const password = this.recoveryForm.get('newPassword')?.value;
		return password && /[0-9]/.test(password);
	}

	hasSpecialChar(): boolean {
		const password = this.recoveryForm.get('newPassword')?.value;
		return password && /[!@#$%^&*(),.?":{}|<>]/.test(password);
	}


	// Método para obtener mensajes de error
	getFieldError(fieldName: string): string {
		const field = this.recoveryForm.get(fieldName);

		if (field?.errors && field.touched) {
			if (field.errors['required']) return 'Este campo es requerido';
			if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
			if (field.errors['missingUpperCase']) return 'Falta al menos una mayúscula';
			if (field.errors['missingLowerCase']) return 'Falta al menos una minúscula';
			if (field.errors['missingNumber']) return 'Falta al menos un número';
			if (field.errors['missingSpecialChar']) return 'Falta al menos un carácter especial';
		}

		return '';
	}

	// Verificar si un campo tiene errores
	hasFieldError(fieldName: string): boolean {
		const field = this.recoveryForm.get(fieldName);
		return !!(field?.errors && field.touched);
	}

	// Enviar formulario
	onSubmit(): void {
		if (this.recoveryForm.invalid) {
			this.recoveryForm.markAllAsTouched();
			return;
		}

		this.isSubmitting = true;
		const payload = {
			token: this.token,
			newPassword: this.recoveryForm.get('newPassword')?.value,
		};

		this.authService.resetPassword(payload).subscribe({
			next: () => {
				this.isSubmitting = false;

				// 🔄 MEJORADO: Limpiar estado de autenticación antes de redirigir
				this.authService.clearAuthState();

				this.alertService.success(
					'Contraseña restablecida',
					'Tu contraseña ha sido cambiada correctamente. Por favor inicia sesión con tu nueva contraseña.'
				).then(() => {
					this.router.navigate(['/Login']);
				});
			},
			error: (e) => {
				this.isSubmitting = false;
				console.log("Hubo un error al restablecer la contraseña.", e);

				this.alertService.error(
					'Error al restablecer',
					'No se pudo cambiar la contraseña. Por favor, intenta nuevamente.'
				);
			}
		});
	}

	goBack(): void {
		this.router.navigate(['/Login']);
	}

	onToggleSidebar(): void {
		this.isSidebarExpanded = !this.isSidebarExpanded;
	}

	expandSidebar(): void {
		this.isSidebarExpanded = true;
	}

	togglePasswordVisibility(field: string): void {
		if (field === 'newPassword') {
			this.showNewPassword = !this.showNewPassword;
		} else if (field === 'confirmPassword') {
			this.showConfirmPassword = !this.showConfirmPassword;
		}
	}
}
