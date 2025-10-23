import { AuthService } from './../../../../../Core/Service/Auth/auth.service';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { OpGroupService } from '../../../../../Core/Service/System/opGroup.service';
import { AlertTotalService } from '../../../../../Core/Service/alert-total.service';
import { AreaManagerNavService } from '../../../../../Core/Service/Navigation/areaManager-nav.service';

@Component({
	selector: 'app-create-operative-group',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatIconModule
	],
	templateUrl: './create-operative-group.component.html',
	styleUrls: [
		'../../../../../Components/Shared/Styles/register-nested-shared.css',
		'./create-operative-group.component.css'
	]
})
export class CreateOperativeGroupComponent {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService)
	private readonly opGroupService = inject(OpGroupService);
	private readonly navService = inject(AreaManagerNavService);
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly fb = inject(FormBuilder);
	private readonly router = inject(Router);

	// Signal para controlar el estado de envío
	isSubmit = signal(false);

	// Formulario reactivo del componente
	operativeGroupForm = this.fb.group({
		groupName: ['', [Validators.required, Validators.minLength(3)]],
		dateStart: ['', [Validators.required, this.dateValidator]],
		dateEnd: ['', [Validators.required, this.dateValidator]]
	}, { validators: this.dateRangeValidator });

	// Validador para fechas individuales
	private dateValidator(control: AbstractControl) {
		if (!control.value) return null;

		const date = new Date(control.value);
		return isNaN(date.getTime()) ? { invalidDate: true } : null;
	}

	// Validador para el rango de fechas
	private dateRangeValidator(group: AbstractControl) {
		const dateStart = group.get('dateStart')?.value;
		const dateEnd = group.get('dateEnd')?.value;

		if (!dateStart || !dateEnd) return null;

		const startDate = new Date(dateStart);
		const endDate = new Date(dateEnd);

		if (startDate >= endDate) {
			return { dateRangeInvalid: true };
		}

		return null;
	}

	onSubmit(): void {
		if (this.operativeGroupForm.invalid || this.isSubmit()) {
			this.operativeGroupForm.markAllAsTouched();
			return;
		}

		const userIdString = this.authService.getIdUser();
		const idUser = parseInt(userIdString, 10);

		this.isSubmit.set(true);

		const formData = this.operativeGroupForm.getRawValue();

		const request = {
			id: 0,
			name: formData.groupName!,
			dateStart: new Date(formData.dateStart!).toISOString(),
			dateEnd: new Date(formData.dateEnd!).toISOString(),
			areaManagerId: idUser
		};

		console.log(request)

		this.opGroupService.create(request).subscribe({
			next: (response) => {
				this.alertService.success(
					'Grupo Creado!',
					`El grupo operativo "${formData.groupName}" ha sido creado exitosamente`
				).then(() => {
					this.navService.triggerRefreshOperatingGroups();
					this.router.navigate(['/areaManager/dashboard']);
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
		this.router.navigate(['/areaManager/dashboard']);
	}
}
