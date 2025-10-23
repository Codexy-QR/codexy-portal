import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { NumericInputDirective } from '../../../../../Core/Directives/numeric-input.directive';
import { BranchCreateRequestMod } from '../../../../../Core/Models/System/Others/NestedCreation/BranchNestedCreation.model';
import { AlertTotalService } from '../../../../../Core/Service/alert-total.service';
import { AdminNavService } from '../../../../../Core/Service/Navigation/admin-nav.service';
import { UserService } from '../../../../../Core/Service/SecurityModule/user.service';
import { BranchService } from '../../../../../Core/Service/System/branch.service';
import { colombianPhoneValidator, documentNumberValidator, emailValidator, mixedPhoneValidator } from '../../../../../Core/Utils/input-validators.utils';

@Component({
	selector: 'app-register-branch',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatIconModule,
		MatStepperModule,
		NumericInputDirective
	],
	templateUrl: './register-branch.component.html',
	styleUrls: ['../../../../../Components/Shared/Styles/register-nested-shared.css', './register-branch.component.css']
})
export class RegisterBranchComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly userService = inject(UserService);
	private readonly branchService = inject(BranchService);
	private readonly navService = inject(AdminNavService);
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly fb = inject(FormBuilder);
	private readonly router = inject(Router);

	// Signals para envío de formularios y paso actual
	isSubmit = signal(false);
	wasSubmitted = false;
	currentStep = signal(0);

	// Variables de estado y control local
	companyId: number | null = null;

	// Listas de opciones y datos estáticos
	documentTypes = [
		{ value: 'TI', label: 'Tarjeta de Identidad' },
		{ value: 'CC', label: 'Cédula de Ciudadanía' },
		{ value: 'CE', label: 'Cédula de Extranjería' },
		{ value: 'PP', label: 'Pasaporte' }
	];

	// Formulario reactivo del componente
	branchForm = this.fb.nonNullable.group({
		// Sección Sucursal
		branchName: ['', [Validators.required, Validators.minLength(3)]],
		branchAddress: ['', [Validators.required, Validators.minLength(5)]],
		branchPhone: ['', [Validators.required, mixedPhoneValidator()]], //

		// Sección Subadministrador
		adminName: ['', [Validators.required, Validators.minLength(3)]],
		adminLastName: ['', [Validators.required, Validators.minLength(3)]],
		adminDocumentType: ['', Validators.required],
		adminDocumentNumber: ['', [Validators.required, documentNumberValidator(6, 10)]],
		adminPhone: ['', [Validators.required, colombianPhoneValidator()]],
		adminEmail: ['', [Validators.required, emailValidator()]]
	});

	nextStep(): void {
		if (this.currentStep() === 0) {
			const branchControls = ['branchName', 'branchAddress', 'branchPhone'];
			branchControls.forEach(control => {
				this.branchForm.get(control)?.markAsTouched();
			});

			if (this.branchForm.get('branchName')?.invalid ||
				this.branchForm.get('branchAddress')?.invalid ||
				this.branchForm.get('branchPhone')?.invalid) {
				return;
			}
		}

		this.currentStep.set(this.currentStep() + 1);
	}

	prevStep(): void {
		this.currentStep.set(this.currentStep() - 1);
	}

	isStepValid(step: number): boolean {
		if (step === 0) {
			return !this.branchForm.get('branchName')?.invalid &&
				!this.branchForm.get('branchAddress')?.invalid &&
				!this.branchForm.get('branchPhone')?.invalid;
		}
		return true;
	}

	ngOnInit(): void {
		this.userService.hasCompany().subscribe({
			next: (res) => {
				if (res.hasCompany && res.companyId) {
					this.companyId = res.companyId;
				}
			},
			error: (err) => console.error('Error obteniendo empresa del usuario:', err)
		});

	}

	onSubmit(): void {
		this.wasSubmitted = true;

		if (this.branchForm.invalid || this.isSubmit()) {
			this.branchForm.markAllAsTouched();
			return;
		}

		this.isSubmit.set(true);

		const formData = this.branchForm.getRawValue();

		// Mapear al DTO esperado por el backend
		const request: BranchCreateRequestMod = {
			branchName: formData.branchName,
			branchAddress: formData.branchAddress,
			branchPhone: formData.branchPhone,
			companyId: this.companyId,

			personName: formData.adminName,
			personLastName: formData.adminLastName,
			personEmail: formData.adminEmail,
			personDocumentType: formData.adminDocumentType,
			personDocumentNumber: formData.adminDocumentNumber,
			personPhone: formData.adminPhone
		};

		this.branchService.createWithAdmin(request).subscribe({
			next: () => {
				this.alertService.success(
					'¡Sucursal Creada!',
					`La sucursal "${formData.branchName}" ha sido creada exitosamente`
				).then(() => {
					this.navService.triggerRefreshBranches(); // ✅ refresca sucursales
					this.router.navigate(['/admin']);
				});

				this.isSubmit.set(false);
			},

			error: (err) => {
				console.error('Error API', err);

				if (err.status === 400 && err.error?.message) {
					this.alertService.warning(
						'Error de validación',
						err.error.message
					);
				} else {
					this.alertService.error(
						'Error en el servidor',
						'Ocurrió un error interno, por favor inténtalo nuevamente'
					);
				}

				this.isSubmit.set(false);
			}
		});


	}

	onCancel(): void {
		this.router.navigate(['/admin']);
	}
}
