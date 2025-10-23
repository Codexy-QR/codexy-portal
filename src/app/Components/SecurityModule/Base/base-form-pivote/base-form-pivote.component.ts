import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';

@Component({
	selector: 'app-base-form-pivote',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatSlideToggleModule,
		MatButtonModule,
		MatIconModule,
	],
	templateUrl: './base-form-pivote.component.html',
	styleUrl: './base-form-pivote.component.css'
})
export class BaseFormPivoteComponent implements OnInit, OnChanges {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);

	// Inyección de servicios nativos de Angular
	private readonly fb = inject(FormBuilder);
	private readonly router = inject(Router);

	// Inputs principales del componente
	@Input() entity: any = null;
	@Input() cancelRoute: string = '/';
	@Input() selectFields: Array<{
		label: string;
		controlName: string;
		options: Array<{ id: number, name: string }>
	}> = [];

	// Outputs de eventos emitidos al componente padre
	@Output() save = new EventEmitter<any>();

	// Variables de estado y control local
	isEditMode = false;
	showReactivarToggle = false;
	reactivarUsuario = false;

	// Formulario reactivo del componente
	form!: FormGroup;

	// Métodos del ciclo de vida del componente
	ngOnInit(): void {
		this.buildForm();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['selectFields'] && !changes['selectFields'].firstChange) {
			// Si cambian los selects, vuelve a construir el formulario
			this.buildForm();
		}

		if (changes['entity'] && this.entity) {
			this.isEditMode = !!this.entity.id;
			if (this.form) {
				this.form.patchValue(this.entity);
			}
		}

		if (this.isEditMode && this.entity) {
			const isInactive = this.entity.active === false;
			const isAdmin = this.authService.getRole() === 'SM_ACTION';
			this.showReactivarToggle = isInactive && isAdmin;
		}
	}

	onToggleChange(event: MatSlideToggleChange): void {
		this.reactivarUsuario = event.checked;
		this.form.patchValue({
			active: event.checked
		});
	}

	private buildForm(): void {
		const controls: any = {
			active: [true]
		};

		for (const field of this.selectFields) {
			controls[field.controlName] = [null, Validators.required];
		}

		this.form = this.fb.group(controls);

		if (this.isEditMode && this.entity) {
			this.form.patchValue(this.entity);
		}
	}

	onSubmit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		const result = {
			...(this.isEditMode ? { id: this.entity.id } : {}),
			...this.form.value
		};

		this.save.emit(result);
	}

	onCancel(): void {
		this.router.navigate([this.cancelRoute]);
	}
}
