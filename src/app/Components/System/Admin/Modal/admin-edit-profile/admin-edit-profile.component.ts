import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { NumericInputDirective } from '../../../../../Core/Directives/numeric-input.directive';
import { UserPartialUpdateMod } from '../../../../../Core/Models/SecurityModule/UserMod.model';
import { AlertTotalService } from '../../../../../Core/Service/alert-total.service';
import { AuthService } from '../../../../../Core/Service/Auth/auth.service';
import { UserService } from '../../../../../Core/Service/SecurityModule/user.service';
import { colombianPhoneValidator, emailValidator } from '../../../../../Core/Utils/input-validators.utils';

@Component({
	selector: 'app-admin-edit-profile-modal',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatIconModule,
		NumericInputDirective
	],
	templateUrl: './admin-edit-profile.component.html',
	styleUrls: ['../../../../Shared/Styles/modal-shared.css', './admin-edit-profile.component.css']
})
export class AdminEditProfileModalComponent implements OnInit, OnChanges {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);
	private readonly userService = inject(UserService);
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly fb = inject(FormBuilder);

	// Inputs principales del componente
	@Input({ required: true }) user!: UserPartialUpdateMod;
	@Input({ required: true }) isOpen = false;

	// Outputs de eventos emitidos al componente padre
	@Output() onClose = new EventEmitter<void>();
	@Output() onSave = new EventEmitter<any>();

	// Signal para controlar el estado de guardado
	isSaving = signal(false);

	// Formulario reactivo del componente
	profileForm!: FormGroup;

	// Métodos del ciclo de vida del componente
	ngOnInit(): void {
		this.initForm();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['user'] && this.profileForm) {
			this.updateFormValues();
		}
	}

	private initForm(): void {
		this.profileForm = this.fb.group({
			name: [
				this.user?.name || '',
				[Validators.required, Validators.minLength(3), Validators.maxLength(50)]
			],
			lastName: [
				this.user?.lastName || '',
				[Validators.required, Validators.minLength(3), Validators.maxLength(50)]
			],
			email: [
				this.user?.email || '',
				[Validators.required, emailValidator()]
			],
			phone: [
				this.user?.phone || '',
				[Validators.required, colombianPhoneValidator()]
			],
			username: [
				this.authService.getUsername() || this.user?.username || '',
				[Validators.required, Validators.minLength(3), Validators.maxLength(50)]
			],
		});
	}


	private updateFormValues(): void {
		this.profileForm.patchValue({
			name: this.user?.name || '',
			lastName: this.user?.lastName || '',
			email: this.user?.email || '',
			phone: this.user?.phone || '',
			username: this.user?.username || ''
		});
	}

	closeModal(): void {
		if (this.isSaving()) return;

		this.profileForm.reset();
		this.onClose.emit();
	}

	saveProfile(): void {
		if (this.profileForm.invalid) {
			this.markFormGroupTouched(this.profileForm);
			return;
		}

		const formData = {
			...this.profileForm.getRawValue(),
			id: this.authService.getIdUser()
		};

		this.alertService.confirm(
			'¿Confirmar cambios?',
			'Se actualizará la información de tu perfil',
			'Sí, actualizar',
			'Cancelar'
		).then((result) => {
			if (result.isConfirmed) {
				this.isSaving.set(true);

				this.userService.partialUpdate(formData).subscribe({
					next: (updatedUser) => {
						this.isSaving.set(false);
						this.alertService.timedAlert(
							'¡Éxito!',
							'Perfil actualizado correctamente',
							'success',
							2000
						);
						this.onSave.emit(updatedUser);
					},
					error: (error) => {
						this.isSaving.set(false);
						const mensaje = error.error?.message || 'No se pudo actualizar el perfil';
						this.alertService.error('Error', mensaje);
					}
				});
			}
		});

	}



	private markFormGroupTouched(formGroup: FormGroup): void {
		Object.keys(formGroup.controls).forEach(key => {
			const control = formGroup.get(key);
			control?.markAsTouched();
		});
	}

	get nameErrors(): string[] {
		const control = this.profileForm.get('name');
		const errors: string[] = [];

		if (control?.errors && control.touched) {
			if (control.errors['required']) errors.push('El nombre es requerido');
			if (control.errors['minlength']) errors.push('Mínimo 3 caracteres');
			if (control.errors['maxlength']) errors.push('Máximo 50 caracteres');
		}

		return errors;
	}

	get lastNameErrors(): string[] {
		const control = this.profileForm.get('lastName');
		const errors: string[] = [];

		if (control?.errors && control.touched) {
			if (control.errors['required']) errors.push('El apellido es requerido');
			if (control.errors['minlength']) errors.push('Mínimo 3 caracteres');
			if (control.errors['maxlength']) errors.push('Máximo 50 caracteres');
		}

		return errors;
	}

	get emailErrors(): string[] {
		const control = this.profileForm.get('email');
		const errors: string[] = [];

		if (control?.errors && control.touched) {
			if (control.errors['required']) errors.push('El email es requerido');
			if (control.errors['emailFormat']) errors.push('Formato de email inválido');
		}

		return errors;
	}

	get phoneErrors(): string[] {
		const control = this.profileForm.get('phone');
		const errors: string[] = [];

		if (control?.errors && control.touched) {
			if (control.errors['required']) errors.push('El teléfono es requerido');
			if (control.errors['colombianPhone']) errors.push(control.errors['colombianPhone']);
		}

		return errors;
	}

	get usernameErrors(): string[] {
		const control = this.profileForm.get('username');
		const errors: string[] = [];

		if (control?.errors && control.touched) {
			if (control.errors['required']) errors.push('El username es requerido');
			if (control.errors['minlength']) errors.push('Mínimo 3 caracteres');
			if (control.errors['maxlength']) errors.push('Máximo 50 caracteres');
		}

		return errors;
	}
}
