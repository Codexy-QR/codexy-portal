import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AlertTotalService } from '../../../../../Core/Service/alert-total.service';
import { OpGroupMod, OpGroupOptionsMod } from '../../../../../Core/Models/System/OpGroupMod';
import { OpGroupService } from '../../../../../Core/Service/System/opGroup.service';

@Component({
	selector: 'app-edit-group',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule
	],
	templateUrl: './edit-group.component.html',
	styleUrls: [
		'../../../../Shared/Styles/modal-shared.css',
		'./edit-group.component.css'
	]
})
export class EditGroupComponent {

	// Inyección de servicios propios del proyecto
	private readonly opGroupService = inject(OpGroupService);
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly fb = inject(FormBuilder);

	// Inputs principales del componente
	@Input({ required: true }) isOpen = false;
	@Input() groupData: OpGroupMod | null = null;

	// Outputs de eventos emitidos al componente padre
	@Output() onClose = new EventEmitter<void>();
	@Output() onSave = new EventEmitter<OpGroupMod>();

	// Signal para el estado de guardado
	saving = signal(false);

	// Formulario reactivo del componente
	editForm: FormGroup;

	constructor() {
		this.editForm = this.fb.group({
			name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
			dateStart: ['', Validators.required],
			dateEnd: ['', Validators.required]
		});
	}

	ngOnChanges(): void {
		if (this.groupData && this.isOpen) {
			this.populateForm();
		}
	}

	private populateForm(): void {
		if (!this.groupData) return;

		this.editForm.patchValue({
			name: this.groupData.name,
			dateStart: this.formatForDatetimeLocalBogota(this.groupData.dateStart),
			dateEnd: this.formatForDatetimeLocalBogota(this.groupData.dateEnd)
		});
	}

	private formatForDatetimeLocalBogota(dateString: string): string {
		const d = new Date(dateString);
		if (isNaN(d.getTime())) return '';
		const parts = new Intl.DateTimeFormat('en-CA', {
			timeZone: 'America/Bogota',
			year: 'numeric', month: '2-digit', day: '2-digit',
			hour: '2-digit', minute: '2-digit', hour12: false
		}).formatToParts(d);
		const get = (t: string) => parts.find(p => p.type === t)?.value || '00';
		return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
	}


	closeModal(): void {
		this.editForm.reset();
		this.onClose.emit();
	}

	async onSubmit(): Promise<void> {
		if (this.editForm.invalid) {
			this.markFormGroupTouched();
			return;
		}

		this.saving.set(true);
		try {
			const payload: OpGroupOptionsMod = {
				id: this.groupData!.id,
				name: this.editForm.get('name')?.value,
				dateStart: this.bogotaLocalToISOString(this.editForm.get('dateStart')?.value),
				dateEnd: this.bogotaLocalToISOString(this.editForm.get('dateEnd')?.value),
				areaManagerId: this.groupData!.areaManagerId
			};

			this.opGroupService.update(payload).subscribe({
				next: (updated) => {
					this.onSave.emit(updated);
					this.alertService.success('Grupo actualizado', 'Los cambios se guardaron correctamente');
					this.closeModal();
				},
				error: (e) => {
					console.error('Error updating group:', e);
					this.alertService.error('Error', 'No se pudo actualizar el grupo');
				},
				complete: () => {
					this.saving.set(false);
				}
			});
		} catch (e) {
			console.error('Error inesperado:', e);
			this.alertService.error('Error', 'No se pudo actualizar el grupo');
			this.saving.set(false);
		}
	}



	private bogotaLocalToISOString(datetimeLocal: string): string {
		if (!datetimeLocal) return '';

		const [datePart, timePartRaw] = datetimeLocal.split('T');
		const [year, month, day] = datePart.split('-').map(Number);

		// Soporta HH:mm, HH:mm:ss y HH:mm:ss.SSS
		const timePart = timePartRaw ?? '00:00';
		const [hhStr, mmStr = '0', rest = '0'] = timePart.split(':');
		const [ssStr = '0', msStr = '0'] = rest.split('.');

		const hh = Number(hhStr);
		const mm = Number(mmStr);
		const ss = Number(ssStr);
		const ms = Number(msStr);

		// Bogotá es UTC-5 ⇒ UTC = Bogotá + 5h
		const utc = new Date(Date.UTC(year, month - 1, day, hh + 5, mm, ss, ms));
		return utc.toISOString(); // incluye milisegundos y termina en 'Z'
	}

	private markFormGroupTouched(): void {
		Object.keys(this.editForm.controls).forEach(key => {
			this.editForm.get(key)?.markAsTouched();
		});
	}

	getFieldError(field: string): string {
		const control = this.editForm.get(field);
		if (control?.touched && control.errors) {
			if (control.errors['required']) {
				return 'Este campo es requerido';
			}
			if (control.errors['minlength']) {
				return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
			}
			if (control.errors['maxlength']) {
				return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
			}
		}
		return '';
	}

	private bogotaLocalToDate(datetimeLocal: string): Date {
		// Interpreta el string como Bogotá y devuelve un Date en UTC
		const [datePart, timePartRaw] = datetimeLocal.split('T');
		const [y, m, d] = datePart.split('-').map(Number);
		const [hh = '0', mm = '0', rest = '0'] = (timePartRaw ?? '00:00').split(':');
		const [ss = '0', ms = '0'] = rest.split('.');
		// Bogotá es UTC-5 ⇒ UTC = Bogotá + 5h
		return new Date(Date.UTC(y, m - 1, d, Number(hh) + 5, Number(mm), Number(ss), Number(ms)));
	}

	validateDates(): boolean {
		const start = this.editForm.get('dateStart')?.value;
		const end = this.editForm.get('dateEnd')?.value;
		if (start && end) {
			return this.bogotaLocalToDate(start).getTime() < this.bogotaLocalToDate(end).getTime();
		}
		return true;
	}

}
