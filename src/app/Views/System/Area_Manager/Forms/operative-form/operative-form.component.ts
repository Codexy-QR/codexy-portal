import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { OperativeService } from '../../../../../Core/Service/System/operative.service';
import { AuthService } from '../../../../../Core/Service/Auth/auth.service';
import { AlertTotalService } from '../../../../../Core/Service/alert-total.service';
import { colombianPhoneValidator, documentNumberValidator, emailValidator } from '../../../../../Core/Utils/input-validators.utils';
import { NumericInputDirective } from '../../../../../Core/Directives/numeric-input.directive';

@Component({
	selector: 'app-operative-form',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatIconModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatCardModule,
		MatProgressSpinnerModule,
		NumericInputDirective
	],
	templateUrl: './operative-form.component.html',
	styleUrls: ['../../../../../Components/Shared/Styles/area-manager-form-shared.css', './operative-form.component.css']
})
export class OperativeFormComponent {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);
	private readonly operativeService = inject(OperativeService);
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly fb = inject(FormBuilder);
	private readonly router = inject(Router);

	// Signals para estados generales del componente
	saving = signal(false);

	// Listas de opciones y datos estáticos
	documentTypes = [
		{ value: 'TI', label: 'Tarjeta de Identidad' },
		{ value: 'CC', label: 'Cédula de Ciudadanía' },
		{ value: 'CE', label: 'Cédula de Extranjería' },
		{ value: 'PP', label: 'Pasaporte' }
	];

	// Formulario reactivo del componente
	operativeForm: FormGroup;

	constructor() {
		this.operativeForm = this.fb.group({
			name: ['', [Validators.required, Validators.minLength(3)]],
			lastName: ['', [Validators.required, Validators.minLength(3)]],
			email: ['', [Validators.required, emailValidator()]],
			documentType: ['', Validators.required],
			documentNumber: ['', [
				Validators.required,
				documentNumberValidator(6, 10)
			]],
			phone: ['', [
				Validators.required,
				colombianPhoneValidator()
			]]
		});
	}

	async onSubmit(): Promise<void> {
		if (this.operativeForm.invalid) {
			this.markFormGroupTouched();
			return;
		}

		this.saving.set(true);

		try {
			const formData = {
				createdByUserId: Number(this.authService.getIdUser()),
				personName: this.operativeForm.get('name')?.value,
				personLastName: this.operativeForm.get('lastName')?.value,
				personEmail: this.operativeForm.get('email')?.value,
				personDocumentType: this.operativeForm.get('documentType')?.value,
				personDocumentNumber: this.operativeForm.get('documentNumber')?.value,
				personPhone: this.operativeForm.get('phone')?.value
			};

			await this.alertService.withLoading(
				async () => {
					return await this.operativeService.createWithOperative(formData).toPromise();
				},
				{
					loadingTitle: 'Creando operativo...',
					loadingText: 'Registrando nuevo operativo en el sistema',
					successTitle: '¡Operativo creado!',
					successText: 'El operativo ha sido registrado correctamente',
					errorTitle: 'Error al crear',
					errorText: 'Error al registrar el operativo'
				}
			);

			this.navigateBack();

		} catch (error: any) {
			console.error('Error saving operative:', error);
			// El error ya fue mostrado por withLoading
		} finally {
			this.saving.set(false);
		}
	}

	private markFormGroupTouched(): void {
		Object.keys(this.operativeForm.controls).forEach(key => {
			this.operativeForm.get(key)?.markAsTouched();
		});
	}

	navigateBack(): void {
		this.router.navigate(['/areaManager/operatives']);
	}

	// Helper para mostrar errores de formulario
	getFieldError(field: string): string {
		const control = this.operativeForm.get(field);
		if (control?.touched && control.errors) {
			if (control.errors['required']) {
				return 'Este campo es requerido';
			}
			if (control.errors['minlength']) {
				return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
			}
			if (control.errors['emailFormat']) {
				return 'Formato de email inválido';
			}
			if (control.errors['documentNumber']) {
				return control.errors['documentNumber'];
			}
			if (control.errors['colombianPhone']) {
				return control.errors['colombianPhone'];
			}
		}
		return '';
	}
}
