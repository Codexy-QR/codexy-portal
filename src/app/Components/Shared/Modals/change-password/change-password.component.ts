import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';
import { UserService } from '../../../../Core/Service/SecurityModule/user.service';
import { performLogout } from '../../../../Core/Utils/auth.utils';
import { AlertTotalService } from '../../../../Core/Service/alert-total.service';

@Component({
	selector: 'app-change-password-modal',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatIconModule,
	],
	templateUrl: './change-password.component.html',
	styleUrls: ['../../../Shared/Styles/modal-shared.css', './change-password.component.css']
})
export class ChangePasswordModalComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);
	private readonly userService = inject(UserService);
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly fb = inject(FormBuilder);
	private readonly router = inject(Router);

	// Inputs principales del componente
	@Input({ required: true }) isOpen = false;

	// Outputs de eventos emitidos al componente padre
	@Output() onClose = new EventEmitter<void>();
	@Output() onSuccess = new EventEmitter<void>();

	// Signals para controlar el estado del formulario de cambio de contraseña
	isChangingPassword = signal(false);
	showCurrentPassword = signal(false);
	showNewPassword = signal(false);
	showConfirmPassword = signal(false);
	newPassword = signal('');

	// Computed para validar las reglas de la nueva contraseña
	hasUpperCase = computed(() => /[A-Z]/.test(this.newPassword()));
	hasLowerCase = computed(() => /[a-z]/.test(this.newPassword()));
	hasNumber = computed(() => /[0-9]/.test(this.newPassword()));
	hasSpecialChar = computed(() => /[!@#$%^&*(),.?":{}|<>]/.test(this.newPassword()));
	hasMinLength = computed(() => this.newPassword().length >= 8);

	// Formulario reactivo del componente
	passwordForm!: FormGroup;

	// Métodos del ciclo de vida del componente
	ngOnInit(): void {
		this.initForm();
	}

	private initForm(): void {
		this.passwordForm = this.fb.group({
			currentPassword: ['', [Validators.required, Validators.minLength(6)]],
			newPassword: ['', [Validators.required, this.passwordStrengthValidator]],
			confirmPassword: ['', [Validators.required]]
		}, {
			validators: [this.passwordMatchValidator, this.differentPasswordValidator]
		});

		this.passwordForm.get('newPassword')?.valueChanges.subscribe(value => {
			this.newPassword.set(value || '');
		});
	}

	private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
		const password = control.value;
		if (!password) return null;

		const hasUpperCase = /[A-Z]/.test(password);
		const hasLowerCase = /[a-z]/.test(password);
		const hasNumber = /[0-9]/.test(password);
		const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
		const hasMinLength = password.length >= 8;

		const valid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && hasMinLength;

		return valid ? null : { passwordStrength: true };
	}

	private passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
		const newPassword = form.get('newPassword')?.value;
		const confirmPassword = form.get('confirmPassword')?.value;

		return newPassword === confirmPassword ? null : { passwordMismatch: true };
	}

	private differentPasswordValidator(form: AbstractControl): ValidationErrors | null {
		const currentPassword = form.get('currentPassword')?.value;
		const newPassword = form.get('newPassword')?.value;

		if (!currentPassword || !newPassword) return null;

		return currentPassword === newPassword ? { samePassword: true } : null;
	}

	onForgotPassword(): void {
		this.alertService.inputEmail('Recuperar contraseña', {
			text: 'Ingresa tu correo electrónico',
			confirmButtonText: 'Enviar',
			cancelButtonText: 'Cancelar'
		}).then((result) => {
			if (result.isConfirmed && result.value) {
				const email = result.value;

				this.alertService.withLoading(
					() => lastValueFrom(this.authService.forgotPassword(email)),
					{
						loadingTitle: 'Enviando solicitud...',
						loadingText: 'Procesando recuperación de contraseña',
						successTitle: 'Solicitud enviada',
						successText: 'Si el email está registrado, recibirás instrucciones en tu bandeja de entrada',
						errorTitle: 'Error',
						errorText: 'Ocurrió un error al procesar la solicitud'
					}
				);
			}
		});
	}


	closeModal(): void {
		if (this.isChangingPassword()) return;

		this.passwordForm.reset();
		this.newPassword.set('');
		this.onClose.emit();
	}

	changePassword(): void {
		if (this.passwordForm.invalid) {
			this.markFormGroupTouched(this.passwordForm);
			return;
		}

		const { currentPassword, newPassword } = this.passwordForm.value;

		this.alertService.confirmWithLoading(
			() => {
				this.isChangingPassword.set(true);
				return lastValueFrom(this.userService.changePassword(currentPassword, newPassword))
					.then(() => {
						this.passwordForm.reset();
						performLogout(this.router, this.authService);
						this.onSuccess.emit();
					})
					.finally(() => {
						this.isChangingPassword.set(false);
					});
			},
			{
				questionTitle: '¿Cambiar contraseña?',
				questionText: 'Se actualizará la contraseña actual',
				confirmText: 'Sí, cambiar',
				cancelText: 'Cancelar',
				loadingTitle: 'Cambiando contraseña...',
				loadingText: 'Actualizando credenciales',
				successTitle: '¡Contraseña cambiada!',
				successText: 'Tu contraseña ha sido actualizada correctamente',
				errorTitle: 'Error',
				errorText: 'Error al cambiar contraseña'
			}
		);
	}

	private markFormGroupTouched(formGroup: FormGroup): void {
		Object.keys(formGroup.controls).forEach(key => {
			const control = formGroup.get(key);
			control?.markAsTouched();
		});
	}

	togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
		switch (field) {
			case 'current':
				this.showCurrentPassword.update(show => !show);
				break;
			case 'new':
				this.showNewPassword.update(show => !show);
				break;
			case 'confirm':
				this.showConfirmPassword.update(show => !show);
				break;
		}
	}

	get currentPasswordErrors(): string[] {
		const control = this.passwordForm.get('currentPassword');
		const errors: string[] = [];

		if (control?.errors && control.touched) {
			if (control.errors['required']) errors.push('La contraseña actual es requerida');
		}

		return errors;
	}

	get newPasswordErrors(): string[] {
		const control = this.passwordForm.get('newPassword');
		const errors: string[] = [];

		if (control?.errors && control.touched) {
			if (control.errors['required']) errors.push('La nueva contraseña es requerida');
			if (control.errors['passwordStrength']) errors.push('La contraseña no cumple los requisitos de seguridad');
		}

		if (this.passwordForm.errors?.['samePassword'] && control?.touched) {
			errors.push('La nueva contraseña no puede ser igual a la actual');
		}

		return errors;
	}

	get confirmPasswordErrors(): string[] {
		const errors: string[] = [];
		const form = this.passwordForm;

		if (form?.errors?.['passwordMismatch'] && form.get('confirmPassword')?.touched) {
			errors.push('Las contraseñas no coinciden');
		}

		return errors;
	}
}
