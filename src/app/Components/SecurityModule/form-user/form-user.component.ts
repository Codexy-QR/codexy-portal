import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PersonAvailableMod } from '../../../Core/Models/SecurityModule/PersonMod.model';
import { UserOptionsMod } from '../../../Core/Models/SecurityModule/UserMod.model';
import { AuthService } from '../../../Core/Service/Auth/auth.service';
import { isAdminRole } from '../../../Core/Utils/auth.utils';
import { strongPassword } from '../../../Core/Utils/input-validators.utils';


@Component({
	selector: 'app-form-user',
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
		MatTooltipModule
	],
	templateUrl: './form-user.component.html',
	styleUrl: './form-user.component.css'
})
export class FormUserComponent implements OnInit, OnChanges {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);

	// Inyección de servicios nativos de Angular
	private readonly fb = inject(FormBuilder);
	private readonly router = inject(Router);

	// Inputs principales del componente
	@Input() userWrite: UserOptionsMod | null = null;
	@Input() persons: PersonAvailableMod[] = [];
	@Input() cancelRoute: string = '/User';

	// Outputs de eventos emitidos al componente padre
	@Output() save = new EventEmitter<UserOptionsMod>();

	// Variables de estado y control local
	hidePassword = true;
	isEditMode = false;
	showReactivarToggle = false;
	reactivarUsuario = false;
	noPersonsAvailable = false;

	// Formulario reactivo del componente
	formUser!: FormGroup;

	// Métodos del ciclo de vida del componente
	ngOnInit(): void {
		this.buildForm();
		console.log(this.persons)
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['userWrite'] && this.userWrite) {
			this.isEditMode = !!this.userWrite.id;

			if (this.formUser) {
				this.patchFormValues(this.userWrite);
			}
		}

		if (changes['persons']) {
			// Evaluar solo si ya se construyo el formulario
			if (this.formUser && !this.isEditMode) {
				if (!this.persons || this.persons.length === 0) {
					this.noPersonsAvailable = true;
					this.formUser.disable();  // Solo afecta creacion
					// this.formUser.get('personId')?.disable(); // Solo afecta creacion

				} else {
					this.noPersonsAvailable = false;
					this.formUser.enable();
				}
			}
		}

		if (this.isEditMode && this.userWrite) {
			this.evaluarReactivarToggle();
		}
	}

	onToggleChange(event: MatSlideToggleChange): void {
		this.reactivarUsuario = event.checked;
		this.formUser.patchValue({
			active: event.checked
		});
	}

	private evaluarReactivarToggle(): void {
		if (!this.isEditMode || !this.userWrite) {
			this.showReactivarToggle = false;
			return;
		}

		const isInactive = this.userWrite.active === false;
		const role = this.authService.getRole();
		const isAdmin = isAdminRole(role);
		this.showReactivarToggle = isInactive && isAdmin;
	}


	private buildForm(): void {
		this.formUser = this.fb.group({
			username: ['', [Validators.required, Validators.minLength(3)]],
			password: ['', [
				Validators.required,
				Validators.minLength(8),
				strongPassword()
			]],
			personId: [null],
			active: [true]
		});

		if (this.isEditMode) {
			// En edicion: personId no es editable, quitar validadores
			this.formUser.get('personId')?.clearValidators();
		} else {
			// En creación: personId es requerido
			this.formUser.get('personId')?.setValidators([Validators.required]);
		}

		this.formUser.get('personId')?.updateValueAndValidity();
	}


	private patchFormValues(userWrite: UserOptionsMod): void {
		this.formUser.patchValue({ ...userWrite });
	}


	onSubmit(): void {
		if (this.formUser.invalid) {
			this.formUser.markAllAsTouched();
			return;
		}

		const formValue = this.formUser.value;

		const userWrite: UserOptionsMod = {
			id: this.isEditMode && this.userWrite?.id ? this.userWrite.id : 0,
			username: formValue.username,
			password: formValue.password,
			active: formValue.active,
			personId: formValue.personId
		};

		this.save.emit(userWrite);
	}


	onCancel(): void {
		this.router.navigate([this.cancelRoute]);
	}
}
