import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { NumericInputDirective } from '../../../../../Core/Directives/numeric-input.directive';
import { ZoneCreateRequestMod } from '../../../../../Core/Models/System/Others/NestedCreation/ZoneNestedCreation.model';
import { AuthService } from '../../../../../Core/Service/Auth/auth.service';
import { SubadminNavService } from '../../../../../Core/Service/Navigation/subadmin-nav.service';
import { BranchService } from '../../../../../Core/Service/System/branch.service';
import { ZoneService } from '../../../../../Core/Service/System/zone.service';
import { AlertTotalService } from '../../../../../Core/Service/alert-total.service';
import { colombianPhoneValidator, documentNumberValidator, emailValidator } from '../../../../../Core/Utils/input-validators.utils';

@Component({
	selector: 'app-register-zone',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatIconModule,
		MatStepperModule,
		NumericInputDirective
	],
	templateUrl: './register-zone.component.html',
	styleUrls: ['../../../../../Components/Shared/Styles/register-nested-shared.css', './register-zone.component.css']
})
export class RegisterZoneComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService)
	private readonly branchService = inject(BranchService);
	private readonly zoneService = inject(ZoneService);
	private readonly navService = inject(SubadminNavService);
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly fb = inject(FormBuilder);
	private readonly router = inject(Router);

	// Signals para control de envío y paso actual del formulario
	isSubmit = signal(false);
	currentStep = signal(0);

	// Variables de estado y control local
	wasSubmitted = false;
	branchId: number | null = null;

	// Listas de opciones y datos estáticos
	documentTypes = [
		{ value: 'TI', label: 'Tarjeta de Identidad' },
		{ value: 'CC', label: 'Cédula de Ciudadanía' },
		{ value: 'CE', label: 'Cédula de Extranjería' },
		{ value: 'PP', label: 'Pasaporte' }
	];


	// Formulario reactivo del componente
	branchForm = this.fb.nonNullable.group({
		// Sección Zone
		zoneName: ['', [Validators.required, Validators.minLength(3)]],
		zoneDescription: ['', [Validators.minLength(5)]],

		// Sección Encargado de Zona
		encZoneName: ['', [Validators.required, Validators.minLength(3)]],
		encZoneLastName: ['', [Validators.required, Validators.minLength(3)]],
		encZoneDocumentType: ['', Validators.required],
		encZoneDocumentNumber: ['', [Validators.required, documentNumberValidator(6, 10)]],
		encZonePhone: ['', [Validators.required, colombianPhoneValidator()]],
		encZoneEmail: ['', [Validators.required, emailValidator()]]
	});

	nextStep(): void {
		if (this.currentStep() === 0) {
			const branchControls = ['zoneName', 'zoneDescription'];
			branchControls.forEach(control => {
				this.branchForm.get(control)?.markAsTouched();
			});

			if (this.branchForm.get('zoneName')?.invalid ||
				this.branchForm.get('zoneDescription')?.invalid) {
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
			return !this.branchForm.get('zoneName')?.invalid &&
				!this.branchForm.get('zoneDescription')?.invalid
		}
		return true;
	}

	ngOnInit(): void {
		const userIdString = this.authService.getIdUser();
		const idUser = parseInt(userIdString, 10);
		if (isNaN(idUser)) {
			console.log('ID de usuario no válido');
			return;
		}

		this.branchService.getByIdInCharge(idUser).pipe(
			catchError(error => {
				console.log('Error al obtener la sucursal: ' + error.message);
				return of(null);
			})
		).subscribe(branch => {
			if (!branch) {
				console.log('No se pudo obtener la sucursal');
				return;
			}
			this.branchId = branch.id;
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
		const request: ZoneCreateRequestMod = {
			zoneName: formData.zoneName,
			zoneDescription: formData.zoneDescription,
			branchId: this.branchId,

			personName: formData.encZoneName,
			personLastName: formData.encZoneLastName,
			personEmail: formData.encZoneEmail,
			personDocumentType: formData.encZoneDocumentType,
			personDocumentNumber: formData.encZoneDocumentNumber,
			personPhone: formData.encZonePhone
		};

		console.log(request)

		this.zoneService.createWithEncZone(request).subscribe({
			next: () => {
				this.alertService.success(
					'Zona Creada!',
					`La Zona "${formData.zoneName}" ha sido creada exitosamente`
				).then(() => {
					this.navService.triggerRefreshZones();
					this.router.navigate(['/subadmin']);
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
		this.router.navigate(['/subadmin']);
	}
}
