import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { OperativeAvailableMod, OperativePartialGpOperativeMod } from '../../../../../Core/Models/System/OperativeMod';
import { AlertTotalService } from '../../../../../Core/Service/alert-total.service';
import { OperativeService } from '../../../../../Core/Service/System/operative.service';
import { OpGroupMod } from '../../../../../Core/Models/System/OpGroupMod';

@Component({
	selector: 'app-add-operative',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule
	],
	templateUrl: './add-operative.component.html',
	styleUrls: [
		'../../../../Shared/Styles/modal-shared.css',
		'./add-operative.component.css'
	]
})
export class AddOperativeComponent implements OnInit, OnChanges {

	// Inyección de servicios propios del proyecto
	private readonly operativeService = inject(OperativeService);
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly fb = inject(FormBuilder);
	private readonly router = inject(Router);

	// Inputs principales del componente
	@Input({ required: true }) isOpen = false;
	@Input({ required: true }) group: OpGroupMod | null = null;
	@Input() refreshTrigger!: boolean;
	@Input() areaManagerId: number | null = null;

	// Outputs de eventos emitidos al componente padre
	@Output() onClose = new EventEmitter<void>();
	@Output() onAdd = new EventEmitter();

	// Signals para estados generales del componente
	loading = signal(false);
	adding = signal(false);

	// Signal con datos de operativos disponibles
	availableOperatives = signal<OperativeAvailableMod[]>([]);

	// Variables de estado y control local
	isSelectFocused = false;

	// Formulario reactivo del componente
	addForm: FormGroup;

	constructor() {
		this.addForm = this.fb.group({
			operativeId: ['', Validators.required]
		});

		// Cargar operativos disponibles hardcodeados
		this.loadAvailableOperatives();
	}

	// Métodos del ciclo de vida del componente
	ngOnInit(): void {
		this.loadAvailableOperatives();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isOpen'] && this.isOpen) {
			this.loadAvailableOperatives();
		}

		if (changes['refreshTrigger']) {
			this.loadAvailableOperatives();
		}
	}

	private loadAvailableOperatives(): void {
		if (!this.areaManagerId) return; // seguridad

		this.loading.set(true);
		this.operativeService.getAllOperativesAvailable(this.areaManagerId).subscribe({
			next: (ops) => {
				this.availableOperatives.set(ops);
				this.loading.set(false);
			},
			error: (err) => {
				console.error('Error cargando operativos disponibles', err);
				this.alertService.error('Error', 'No se pudo cargar la lista de operativos disponibles');
				this.loading.set(false);
			}
		});
	}

	closeModal(): void {
		this.addForm.reset();
		this.onClose.emit();
	}

	navigateToCreateOperative(): void {
		this.closeModal();
		this.router.navigate(['/areaManager/operative-create']);
	}

	async onSubmit(): Promise<void> {
		if (this.addForm.invalid) {
			this.markFormGroupTouched();
			return;
		}

		if (!this.group) {
			await this.alertService.error('Error', 'No se ha seleccionado un grupo válido');
			return;
		}

		const payload: OperativePartialGpOperativeMod = {
			id: this.addForm.value.operativeId,
			operativeGroupId: this.group.id,
			groupName: this.group.name,
			dateStart: this.group.dateStart,
			dateEnd: this.group.dateEnd,
		};

		try {
			const updated = await this.alertService.withLoading(
				() => this.operativeService.partialUpdate(payload).toPromise(),
				{
					loadingTitle: 'Agregando operativo...',
					loadingText: 'Por favor espera mientras se procesa',
					successTitle: 'Operativo agregado',
					successText: 'El operativo fue agregado al grupo correctamente',
					errorTitle: 'Error',
					errorText: 'No se pudo agregar el operativo al grupo',
				}
			);

			this.onAdd.emit();
			this.closeModal();
		} catch (e) {
			console.error('Error al agregar operativo:', e);
			// El error ya fue mostrado en withLoading, así que aquí no hace falta mostrar otra alerta.
		}
	}


	private markFormGroupTouched(): void {
		Object.keys(this.addForm.controls).forEach(key => {
			this.addForm.get(key)?.markAsTouched();
		});
	}

	getFieldError(field: string): string {
		const control = this.addForm.get(field);
		if (control?.touched && control.errors) {
			if (control.errors['required']) {
				return 'Este campo es requerido';
			}
		}
		return '';
	}

	onSelectFocus(): void {
		this.isSelectFocused = true;
	}

	onSelectBlur(): void {
		this.isSelectFocused = false;
	}
}
