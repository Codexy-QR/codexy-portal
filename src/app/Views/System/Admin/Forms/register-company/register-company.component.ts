import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { NumericInputDirective } from "../../../../../Core/Directives/numeric-input.directive";
import { CompanyOptionsMod } from '../../../../../Core/Models/System/CompanyMod.model';
import { AlertTotalService } from '../../../../../Core/Service/alert-total.service';
import { AuthService } from '../../../../../Core/Service/Auth/auth.service';
import { CompanyService } from '../../../../../Core/Service/System/company.service';
import { emailValidator } from '../../../../../Core/Utils/input-validators.utils';
import { lastValueFrom } from 'rxjs';


@Component({
	selector: 'app-register-company',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatIconModule,
		NumericInputDirective
	],
	templateUrl: './register-company.component.html',
	styleUrls: ['./register-company.component.css']
})
export class RegisterCompanyComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);
	private readonly companyService = inject(CompanyService);
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly fb = inject(FormBuilder);
	private readonly router = inject(Router);

	// Signal para controlar el estado de envío
	isSubmit = signal(false);

	wasSubmitted = false;
	idUser: number = 0;
	companyForm!: FormGroup;

	industries = [{ id: 1, name: 'Tecnología' }, { id: 2, name: 'Manufactura' }, { id: 3, name: 'Retail' }, { id: 4, name: 'Salud' },
	{ id: 5, name: 'Educación' }, { id: 6, name: 'Finanzas' }, { id: 7, name: 'Construcción' }, { id: 8, name: 'Transporte' },
	{ id: 9, name: 'Agricultura' }, { id: 10, name: 'Otro' }
	];

	private nitValidator(control: AbstractControl): ValidationErrors | null {
		const value = control.value;

		if (!value) return null;

		// Patrón: exactamente 9 dígitos numéricos
		const nitPattern = /^\d{9}$/;

		if (!nitPattern.test(value)) {
			return { invalidNIT: true };
		}

		return null;
	}


	ngOnInit(): void {
		const userIdString = this.authService.getIdUser();
		this.idUser = parseInt(userIdString, 10);

		this.companyForm = this.fb.nonNullable.group({
			name: ['', [Validators.required, Validators.minLength(3)]],
			businessName: ['', [Validators.required, Validators.minLength(3)]],
			nit: ['', [Validators.required, this.nitValidator.bind(this)]],
			industryId: ['', Validators.required],
			email: ['', [Validators.required, emailValidator()]],
			website: ['', Validators.pattern(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)],
			// termsAccepted: [false, Validators.requiredTrue],
			userId: [this.idUser]
		});
	}

	async onSubmit(): Promise<void> {
		this.wasSubmitted = true;

		if (this.companyForm.invalid || this.isSubmit()) {
			this.companyForm.markAllAsTouched();

			// Opcional: Mostrar errores del formulario
			const errors = this.getFormErrors();
			if (errors.length > 0) {
				this.alertService.warning(
					'Formulario incompleto',
					`Por favor corrige los siguientes campos:\n• ${errors.join('\n• ')}`
				);
			}
			return;
		}

		this.isSubmit.set(true);

		const formData = this.companyForm.getRawValue();
		const companyData: CompanyOptionsMod = {
			name: formData.name,
			businessName: formData.businessName,
			nit: formData.nit,
			industryId: formData.industryId,
			email: formData.email,
			website: formData.website || undefined,
			userId: formData.userId
		};

		try {
			await this.alertService.withLoading(
				async () => {
					return await lastValueFrom(this.companyService.createCompany(companyData));
				},
				{
					loadingTitle: 'Registrando empresa...',
					loadingText: 'Creando tu empresa en el sistema',
					successTitle: '¡Empresa registrada exitosamente!',
					successText: 'La empresa ha sido creada correctamente',
					errorTitle: 'Error al registrar empresa',
					errorText: 'No se pudo registrar la empresa'
				}
			);

			// Navegar después del éxito
			this.router.navigate(['/admin/dashboard/']);

		} catch (error) {
			console.error('Error al registrar empresa:', error);
			// Error ya manejado por withLoading
		} finally {
			this.isSubmit.set(false);
		}
	}

	// Método helper para obtener errores del formulario (opcional)
	private getFormErrors(): string[] {
		const errors: string[] = [];
		const controls = this.companyForm.controls;

		Object.keys(controls).forEach(key => {
			const control = controls[key];
			if (control.errors && control.touched) {
				const fieldName = this.getFieldDisplayName(key);

				if (control.errors['required']) {
					errors.push(`${fieldName} es requerido`);
				}
				if (control.errors['email']) {
					errors.push(`${fieldName} debe ser válido`);
				}
				if (control.errors['minlength']) {
					errors.push(`${fieldName} es muy corto`);
				}
				if (control.errors['maxlength']) {
					errors.push(`${fieldName} es muy largo`);
				}
			}
		});

		return errors;
	}

	private getFieldDisplayName(fieldName: string): string {
		const displayNames: { [key: string]: string } = {
			name: 'Nombre',
			businessName: 'Razón social',
			nit: 'NIT',
			industryId: 'Industria',
			email: 'Email',
			website: 'Sitio web',
			userId: 'Usuario'
		};
		return displayNames[fieldName] || fieldName;
	}

	onCancel(): void {
		if (this.companyForm.dirty) {
			this.alertService.confirm(
				'¿Estás seguro?',
				'Se perderán todos los datos ingresados.',
				'Sí, cancelar',
				'No, continuar'
			).then((result) => {
				if (result.isConfirmed) {
					this.router.navigate(['/admin/welcome']);
				}
			});
		} else {
			this.router.navigate(['/admin/welcome']);
		}
	}


	// Método auxiliar para obtener mensajes de error de los campos
	getFieldError(fieldName: string): string {
		const field = this.companyForm.get(fieldName);
		if (field?.errors && (field.dirty || field.touched || this.wasSubmitted)) {
			if (field.errors['required']) return 'Este campo es requerido';
			if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
			if (field.errors['email']) return 'Email debe tener un formato válido';
			if (field.errors['invalidNIT']) return 'El NIT debe tener exactamente 9 dígitos';
			if (field.errors['pattern']) {
				if (fieldName === 'website') return 'Formato de URL inválido';
			}
		}
		return '';
	}

	// Método para verificar si un campo tiene errores
	hasFieldError(fieldName: string): boolean {
		const field = this.companyForm.get(fieldName);
		return !!(field?.errors && (field.dirty || field.touched || this.wasSubmitted));
	}
}
