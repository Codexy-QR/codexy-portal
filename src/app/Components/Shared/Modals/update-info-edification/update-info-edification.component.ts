import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AlertTotalService } from '../../../../Core/Service/alert-total.service';

export interface EditField {
	key: string;
	label: string;
	type?: string;
	validators?: any[];
	visible?: boolean;
}

@Component({
	selector: 'app-update-info-edification',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatIconModule
	],
	templateUrl: './update-info-edification.component.html',
	styleUrls: [
		'../../Styles/modal-shared.css',
		'./update-info-edification.component.css'
	]
})
export class UpdateInfoEdificationComponent implements OnInit, OnChanges {

	// Inyección de servicios propios del proyecto
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly fb = inject(FormBuilder);

	// Inputs principales del componente
	@Input({ required: true }) entityData: any;
	@Input({ required: true }) isOpen = false;
	@Input({ required: true }) entityType: string = 'Entidad';
	@Input({ required: true }) editFields: EditField[] = [];
	@Input() saveService!: (data: any) => any;

	// Outputs de eventos emitidos al componente padre
	@Output() onClose = new EventEmitter<void>();
	@Output() onSave = new EventEmitter<any>();

	// Signal para controlar el estado de guardado
	isSaving = signal(false);

	// Formulario reactivo del componente
	editForm!: FormGroup;

	// Métodos del ciclo de vida del componente
	ngOnInit(): void {
		this.initForm();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['entityData'] && this.editForm) {
			this.updateFormValues();
		}
	}

	private initForm(): void {
		const formGroupConfig: any = {};

		this.editFields.forEach(field => {
			if (field.visible !== false) {
				formGroupConfig[field.key] = [
					this.entityData?.[field.key] || '',
					field.validators || []
				];
			}
		});

		this.editForm = this.fb.group(formGroupConfig);
	}

	private updateFormValues(): void {
		if (this.entityData && this.editForm) {
			const formValues: any = {};

			this.editFields.forEach(field => {
				if (field.visible !== false) {
					formValues[field.key] = this.entityData[field.key] || '';
				}
			});

			this.editForm.patchValue(formValues);
		}
	}

	closeModal(): void {
		if (this.isSaving()) return;

		this.editForm.reset();
		this.onClose.emit();
	}

	async saveChanges(): Promise<void> {
		if (this.editForm.invalid) {
			this.markFormGroupTouched(this.editForm);
			return;
		}

		const formData = {
			...this.editForm.getRawValue(),
			id: this.entityData?.id
		};

		try {
			if (this.saveService) {
				// Con servicio de guardado
				await this.alertService.confirmWithLoading(
					async () => {
						this.isSaving.set(true);
						try {
							return await this.saveService(formData).toPromise();
						} finally {
							this.isSaving.set(false);
						}
					},
					{
						questionTitle: '¿Confirmar cambios?',
						questionText: `Se actualizará la información de ${this.entityType.toLowerCase()}`,
						confirmText: 'Sí, actualizar',
						cancelText: 'Cancelar',
						icon: 'question',
						loadingTitle: 'Actualizando...',
						loadingText: `Guardando cambios en ${this.entityType.toLowerCase()}`,
						successTitle: '¡Actualización exitosa!',
						successText: `${this.entityType} actualizado correctamente`,
						errorTitle: 'Error al actualizar',
						errorText: `No se pudo actualizar ${this.entityType.toLowerCase()}`
					}
				).then((result) => {
					if (result) {
						this.onSave.emit(result);
					}
				});

			} else {
				// Sin servicio, solo confirmación y emisión de datos
				const confirmed = await this.alertService.confirm(
					'¿Confirmar cambios?',
					`Se actualizará la información de ${this.entityType.toLowerCase()}`,
					'Sí, actualizar',
					'Cancelar'
				);

				if (confirmed.isConfirmed) {
					this.alertService.success(
						'¡Cambios confirmados!',
						`Los datos de ${this.entityType.toLowerCase()} han sido actualizados`
					);
					this.onSave.emit(formData);
				}
			}

		} catch (error: any) {
			// 🔄 SIMPLIFICADO: El error ya fue manejado por confirmWithLoading
			console.error('Error al actualizar:', error);
		}
	}

	private markFormGroupTouched(formGroup: FormGroup): void {
		Object.keys(formGroup.controls).forEach(key => {
			const control = formGroup.get(key);
			control?.markAsTouched();
		});
	}

	getFieldErrors(fieldKey: string): string[] {
		const control = this.editForm.get(fieldKey);
		const errors: string[] = [];

		if (control?.errors && control.touched) {
			if (control.errors['required']) errors.push('Este campo es requerido');
			if (control.errors['minlength']) errors.push(`Mínimo ${control.errors['minlength'].requiredLength} caracteres`);
			if (control.errors['maxlength']) errors.push(`Máximo ${control.errors['maxlength'].requiredLength} caracteres`);
			if (control.errors['email']) errors.push('Formato de email inválido');
			if (control.errors['pattern']) errors.push('Formato inválido');
			if (control.errors['min']) errors.push(`Valor mínimo: ${control.errors['min'].min}`);
			if (control.errors['max']) errors.push(`Valor máximo: ${control.errors['max'].max}`);

			// 🔄 MEJORA: Más validaciones personalizadas
			if (control.errors['phoneNumber']) errors.push('Número de teléfono inválido');
			if (control.errors['documentNumber']) errors.push('Número de documento inválido');
		}

		return errors;
	}
}
