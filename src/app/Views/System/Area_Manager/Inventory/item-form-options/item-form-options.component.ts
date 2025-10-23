import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemOptionsMod } from '../../../../../Core/Models/System/ItemMod.model';
import { AuthService } from '../../../../../Core/Service/Auth/auth.service';
import { CategoryItemService } from '../../../../../Core/Service/ParametersModule/category-item.service';
import { StateItemService } from '../../../../../Core/Service/ParametersModule/state-item.service';
import { ItemService } from '../../../../../Core/Service/System/item.service';
import { ZoneService } from '../../../../../Core/Service/System/zone.service';
import { AlertTotalService } from '../../../../../Core/Service/alert-total.service';

@Component({
	selector: 'app-item-form-options',
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
		MatProgressSpinnerModule
	],
	templateUrl: './item-form-options.component.html',
	styleUrls: ['../../../../../Components/Shared/Styles/area-manager-form-shared.css', './item-form-options.component.css']
})
export class ItemFormOptionsComponent implements OnInit, OnDestroy {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);
	private readonly categoryItemService = inject(CategoryItemService);
	private readonly stateItemService = inject(StateItemService);
	private readonly itemService = inject(ItemService);
	private readonly zoneService = inject(ZoneService);
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly fb = inject(FormBuilder);
	private readonly router = inject(Router);
	private readonly route = inject(ActivatedRoute);

	// Signals para estados y modo de edición
	loading = signal(true);
	saving = signal(false);
	isEditMode = signal(false);
	itemId: number | null = null;

	// Signals para opciones de selección
	categories = signal<any[]>([]);
	states = signal<any[]>([]);
	zoneId = signal<number>(0);

	// Formulario reactivo del componente
	itemForm: FormGroup;

	constructor() {
		this.itemForm = this.fb.group({
			code: ['', [Validators.required, Validators.maxLength(50)]],
			name: ['', [Validators.required, Validators.maxLength(100)]],
			description: ['', [Validators.maxLength(500)]],
			categoryItemId: ['', Validators.required],
			stateItemId: ['', Validators.required]
		});
	}

	async ngOnInit(): Promise<void> {
		// Verificar si estamos en modo edición
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.isEditMode.set(true);
				this.itemId = +params['id'];
			}
		});

		await this.loadInitialData();

		if (this.isEditMode()) {
			await this.loadItemData();
			this.itemForm.get('code')?.disable();
		}

		this.loading.set(false);
	}

	ngOnDestroy(): void {
		// Cleanup si es necesario
	}

	private async loadInitialData(): Promise<void> {
		try {
			await this.alertService.withLoading(
				async () => {
					// Cargar categorías
					const categoriesData = await this.categoryItemService.getAll().toPromise();
					this.categories.set(categoriesData || []);

					// Cargar estados
					const statesData = await this.stateItemService.getAll().toPromise();
					this.states.set(statesData || []);

					// Obtener zoneId del usuario actual
					const userId = this.authService.getIdUser();
					const zoneData = await this.zoneService.getByIdAreaManager(Number(userId)).toPromise();
					this.zoneId.set(zoneData?.id || 0);

					return true; // Retornar algo para indicar éxito
				},
				{
					loadingTitle: 'Cargando datos...',
					loadingText: 'Obteniendo categorías, estados y zona',
					showSuccessAlert: false, // No mostrar alerta de éxito
					errorTitle: 'Error de carga',
					errorText: 'Error al cargar datos iniciales'
				}
			);
		} catch (error) {
			console.error('Error loading initial data:', error);
			// El error ya fue mostrado por withLoading
		}
	}

	private async loadItemData(): Promise<void> {
		if (!this.itemId) return;

		try {
			const item = await this.alertService.withLoading(
				async () => {
					return await this.itemService.getById(this.itemId!).toPromise();
				},
				{
					loadingTitle: 'Cargando item...',
					loadingText: 'Obteniendo datos del item',
					showSuccessAlert: false,
					errorTitle: 'Error de carga',
					errorText: 'Error al cargar datos del item'
				}
			);

			if (item) {
				this.itemForm.patchValue({
					code: item.code,
					name: item.name,
					description: item.description || '',
					categoryItemId: item.categoryItemId,
					stateItemId: item.stateItemId
				});
			}
		} catch (error) {
			console.error('Error loading item data:', error);
			// El error ya fue mostrado por withLoading
		}
	}

	async onSubmit(): Promise<void> {
		if (this.itemForm.invalid) {
			this.markFormGroupTouched();
			return;
		}

		this.saving.set(true);

		try {
			// Preparar datos del formulario
			let formData: ItemOptionsMod;

			if (this.isEditMode()) {
				// En modo edición, habilitar temporalmente el campo para obtener el valor
				this.itemForm.get('code')?.enable();
				formData = {
					...this.itemForm.value,
					zoneId: this.zoneId(),
					id: this.itemId!
				};
				// Volver a deshabilitar el campo
				this.itemForm.get('code')?.disable();
			} else {
				// En modo creación, usar los valores directamente
				formData = {
					...this.itemForm.value,
					zoneId: this.zoneId(),
					id: 0
				};
			}

			if (this.isEditMode()) {
				await this.alertService.withLoading(
					async () => {
						return await this.itemService.update(formData).toPromise();
					},
					{
						loadingTitle: 'Actualizando item...',
						loadingText: 'Guardando cambios',
						successTitle: '¡Item actualizado!',
						successText: 'El item ha sido actualizado correctamente',
						errorTitle: 'Error al actualizar',
						errorText: 'Error al actualizar el item'
					}
				);
			} else {
				await this.alertService.withLoading(
					async () => {
						return await this.itemService.create(formData).toPromise();
					},
					{
						loadingTitle: 'Creando item...',
						loadingText: 'Guardando nuevo item',
						successTitle: '¡Item creado!',
						successText: 'El item ha sido creado correctamente',
						errorTitle: 'Error al crear',
						errorText: 'Error al crear el item'
					}
				);
			}

			this.navigateBack();

		} catch (error: any) {
			console.error('Error saving item:', error);
			// El error ya fue mostrado por withLoading
		} finally {
			this.saving.set(false);
		}
	}

	private markFormGroupTouched(): void {
		Object.keys(this.itemForm.controls).forEach(key => {
			this.itemForm.get(key)?.markAsTouched();
		});
	}


	navigateBack(): void {
		this.router.navigate(['/areaManager/inventory-base']);
	}

	// Helper para mostrar errores de formulario
	getFieldError(field: string): string {
		const control = this.itemForm.get(field);
		if (control?.touched && control.errors) {
			if (control.errors['required']) {
				return 'Este campo es requerido';
			}
			if (control.errors['maxlength']) {
				return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
			}
		}
		return '';
	}
}
