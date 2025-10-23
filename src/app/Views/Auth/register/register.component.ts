import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { InitialHeaderComponent } from "../../../Components/System/Landing/initial-header/initial-navbar.component";
import { NumericInputDirective } from '../../../Core/Directives/numeric-input.directive';
import { AlertTotalService } from '../../../Core/Service/alert-total.service';
import { AuthService } from '../../../Core/Service/Auth/auth.service';
import { colombianPhoneValidator, documentNumberValidator, emailValidator, strongPassword } from '../../../Core/Utils/input-validators.utils';

@Component({
	selector: 'app-register',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatIconModule,
		MatToolbarModule,
		RouterLink,
		InitialHeaderComponent,
		NumericInputDirective
	],
	templateUrl: './register.component.html',
	styleUrl: './register.component.css'
})
export class RegisterComponent {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly fb = inject(FormBuilder);
	private readonly router = inject(Router);

	// Signal para controlar el estado del envío de formularios
	isSubmitting = signal(false);

	// Variables de estado y control local
	hidePassword = true;
	wasSubmitted = false;

	// Listas de opciones y datos estáticos
	documentTypes = [
		{ value: 'TI', label: 'Tarjeta de Identidad' },
		{ value: 'CC', label: 'Cédula de Ciudadanía' },
		{ value: 'CE', label: 'Cédula de Extranjería' },
		{ value: 'PP', label: 'Pasaporte' }
	];

	// Formulario reactivo del componente
	registerForm = this.fb.nonNullable.group({
		username: ['', [Validators.required, Validators.minLength(3)]],
		password: ['', [Validators.required, Validators.minLength(8), strongPassword()]],
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
		]],
	});

	async onSubmit(): Promise<void> {
		this.wasSubmitted = true;

		if (this.registerForm.invalid || this.isSubmitting()) {
			this.registerForm.markAllAsTouched();

			// 🔄 MEJORA: Mostrar errores específicos del formulario
			const errors = this.getFormErrors();
			if (errors.length > 0) {
				this.alertService.warning(
					'Formulario incompleto',
					`Por favor corrige los siguientes errores:\n• ${errors.join('\n• ')}`
				);
			}
			return;
		}

		this.isSubmitting.set(true);

		const {
			username,
			password,
			name,
			lastName,
			email,
			documentType,
			documentNumber,
			phone,
		} = this.registerForm.getRawValue();

		try {
			await this.alertService.withLoading(
				() => lastValueFrom(this.authService.register({
					username: username!,
					password: password!,
					name: name!,
					lastName: lastName!,
					email: email!.trim().toLowerCase(),
					documentType: documentType!,
					documentNumber: documentNumber!,
					phone: phone!,
				})),
				{
					loadingTitle: 'Creando cuenta...',
					loadingText: 'Procesando tu registro',
					successTitle: 'Registro Exitoso',
					successText: 'Tu cuenta ha sido creada. Revisa tu correo electrónico 📧',
					errorTitle: 'Error en el registro',
					errorText: 'Ocurrió un error al crear tu cuenta'
				}
			);

			// 🔄 MEJORA: Navegación automática tras éxito
			// El servicio ya mostró la alerta de éxito, ahora navegamos
			this.router.navigate(['/Login']);

		} catch (error: any) {
			// 🔄 SIMPLIFICADO: El error ya fue mostrado por withLoading
			console.error('Error al registrar:', error);

			// 🔄 OPCIONAL: Logging adicional para debugging
			if (error?.error?.error) {
				console.log('Detalles del error de la API:', error.error.error);
			}

		} finally {
			this.isSubmitting.set(false);
		}
	}

	// 🔄 NUEVO: Método helper para obtener errores del formulario
	private getFormErrors(): string[] {
		const errors: string[] = [];

		Object.keys(this.registerForm.controls).forEach(key => {
			const control = this.registerForm.get(key);
			if (control?.errors && control.touched) {
				const fieldName = this.getFieldDisplayName(key);

				if (control.errors['required']) {
					errors.push(`${fieldName} es requerido`);
				}
				if (control.errors['minlength']) {
					const requiredLength = control.errors['minlength'].requiredLength;
					errors.push(`${fieldName} debe tener al menos ${requiredLength} caracteres`);
				}
				if (control.errors['strongPassword']) {
					errors.push(`${fieldName} debe ser más segura`);
				}
				if (control.errors['email']) {
					errors.push(`${fieldName} debe ser un correo válido`);
				}
				if (control.errors['documentNumber']) {
					errors.push(`${fieldName} debe tener entre 6 y 10 dígitos`);
				}
				if (control.errors['colombianPhone']) {
					errors.push(`${fieldName} debe ser un teléfono colombiano válido`);
				}
			}
		});

		return errors;
	}

	// 🔄 NUEVO: Método helper para nombres de campos más amigables
	private getFieldDisplayName(fieldName: string): string {
		const displayNames: { [key: string]: string } = {
			username: 'Nombre de usuario',
			password: 'Contraseña',
			name: 'Nombre',
			lastName: 'Apellido',
			email: 'Correo electrónico',
			documentType: 'Tipo de documento',
			documentNumber: 'Número de documento',
			phone: 'Teléfono'
		};

		return displayNames[fieldName] || fieldName;
	}
}
