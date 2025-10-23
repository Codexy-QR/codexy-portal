import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { CheckerService } from '../../../../../Core/Service/System/checker.service';
import { AuthService } from '../../../../../Core/Service/Auth/auth.service';
import { AlertTotalService } from '../../../../../Core/Service/alert-total.service';
import { colombianPhoneValidator, documentNumberValidator, emailValidator } from '../../../../../Core/Utils/input-validators.utils';
import { NumericInputDirective } from '../../../../../Core/Directives/numeric-input.directive';
import { BranchService } from '../../../../../Core/Service/System/branch.service';
import { CheckerCreateRequestDTO } from '../../../../../Core/Models/System/Others/NestedCreation/CheckerNestedCreation.model';

@Component({
	selector: 'app-register-checker',
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
	templateUrl: './register-checker.component.html',
	styleUrls: ['../../../../../Components/Shared/Styles/area-manager-form-shared.css', './register-checker.component.css']
})
export class RegisterCheckerComponent implements OnInit {

	// Inyección de servicios
	private readonly authService = inject(AuthService);
	private readonly checkerService = inject(CheckerService);
	private readonly branchService = inject(BranchService);
	private readonly alertService = inject(AlertTotalService);
	private readonly fb = inject(FormBuilder);
	private readonly router = inject(Router);

	// Signals para estados del componente
	saving = signal(false);
	branchId = signal<number | null>(null);

	// Listas de opciones
	documentTypes = [
		{ value: 'TI', label: 'Tarjeta de Identidad' },
		{ value: 'CC', label: 'Cédula de Ciudadanía' },
		{ value: 'CE', label: 'Cédula de Extranjería' },
		{ value: 'PP', label: 'Pasaporte' }
	];

	// Formulario reactivo
	checkerForm: FormGroup;

	constructor() {
		this.checkerForm = this.fb.group({
			personName: ['', [Validators.required, Validators.minLength(3)]],
			personLastName: ['', [Validators.required, Validators.minLength(3)]],
			personEmail: ['', [Validators.required, emailValidator()]],
			personDocumentType: ['', Validators.required],
			personDocumentNumber: ['', [
				Validators.required,
				documentNumberValidator(6, 10)
			]],
			personPhone: ['', [
				Validators.required,
				colombianPhoneValidator()
			]]
		});
	}

	ngOnInit(): void {
		this.loadBranchForUser();
	}

	private loadBranchForUser(): void {
		const userIdString = this.authService.getIdUser();

		if (!userIdString) {
			console.error('No se pudo obtener el ID del usuario');
			return;
		}

		const idUser = parseInt(userIdString, 10);
		if (isNaN(idUser)) {
			console.error('ID de usuario inválido');
			return;
		}

		this.branchService.getByIdInCharge(idUser).subscribe({
			next: (branch) => {
				if (branch && branch.id) {
					this.branchId.set(branch.id);
				} else {
					console.error('No se pudo obtener la sucursal del usuario');
					this.alertService.error('Error', 'No se pudo obtener la sucursal del usuario');
				}
			},
			error: (error) => {
				console.error('Error al obtener la sucursal:', error);
				this.alertService.error('Error', 'No se pudo cargar la información de la sucursal');
			}
		});
	}

	async onSubmit(): Promise<void> {
		if (this.checkerForm.invalid || !this.branchId()) {
			this.markFormGroupTouched();
			if (!this.branchId()) {
				this.alertService.error('Error', 'No se pudo obtener la sucursal del usuario');
			}
			return;
		}

		this.saving.set(true);

		try {
			const request: CheckerCreateRequestDTO = {
				branchId: this.branchId()!,
				personName: this.checkerForm.get('personName')?.value,
				personLastName: this.checkerForm.get('personLastName')?.value,
				personEmail: this.checkerForm.get('personEmail')?.value,
				personDocumentType: this.checkerForm.get('personDocumentType')?.value,
				personDocumentNumber: this.checkerForm.get('personDocumentNumber')?.value,
				personPhone: this.checkerForm.get('personPhone')?.value
			};

			await this.alertService.withLoading(
				async () => {
					return await this.checkerService.createByBranch(request).toPromise();
				},
				{
					loadingTitle: 'Creando Verificador...',
					loadingText: 'Registrando nuevo Verificador en el sistema',
					successTitle: 'Verificador creado!',
					successText: 'El Verificador ha sido registrado correctamente',
					errorTitle: 'Error al crear',
					errorText: 'Error al registrar el Verificador'
				}
			);

			this.navigateBack();

		} catch (error: any) {
			console.error('Error saving checker:', error);
			// El error ya fue mostrado por withLoading
		} finally {
			this.saving.set(false);
		}
	}

	private markFormGroupTouched(): void {
		Object.keys(this.checkerForm.controls).forEach(key => {
			this.checkerForm.get(key)?.markAsTouched();
		});
	}

	navigateBack(): void {
		this.router.navigate(['/subadmin/checkers-list']);
	}

	// Helper para mostrar errores de formulario
	getFieldError(field: string): string {
		const control = this.checkerForm.get(field);
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
