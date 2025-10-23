import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseFormEntityComponent } from '../../../../Components/SecurityModule/Base/base-form-entity/base-form-entity.component';
import { FormMod } from '../../../../Core/Models/SecurityModule/FormMod.model';
import { FormService } from '../../../../Core/Service/SecurityModule/form.service';
import { AlertTotalService } from '../../../../Core/Service/alert-total.service';

@Component({
	selector: 'app-update-form',
	standalone: true,
	imports: [BaseFormEntityComponent],
	templateUrl: './update-form.component.html',
	styleUrl: './update-form.component.css'
})
export class UpdateFormComponent {

	// Inyección de servicios propios del proyecto
	private readonly formService = inject(FormService);
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly router = inject(Router);
	private readonly route = inject(ActivatedRoute);

	form: FormMod | null = null;

	ngOnInit(): void {
		const formId = Number(this.route.snapshot.paramMap.get('id'));
		this.formService.getById(formId).subscribe({
			next: (data) => this.form = data,
			error: (err) => {
				console.log('Error al obtener Datos:', err);
				const mensajeCompleto = err?.error?.message || 'Ocurrio un error inesperado.';
				const mensaje = mensajeCompleto.split(':')[1]?.trim() || mensajeCompleto;
				this.alertService.error('Error', mensaje);
			}
		});
	}

	handleSaveForm(updatedForm: FormMod): void {
		if (!updatedForm.id) return;
		// console.log(updatedForm)
		this.formService.update(updatedForm).subscribe({
			next: () => {
				this.alertService.success('Actualizacion exitosa', `Se actualizó ${updatedForm.name} ✅`)
					.then(() => {
						this.router.navigate(['/securitymodule/Form']);
					});
			},
			error: (err) => {
				console.log('Error al actualizar Form:', err);
				const mensajeCompleto = err?.error?.message || 'Ocurrio un error inesperado.';
				const mensaje = mensajeCompleto.split(':')[1]?.trim() || mensajeCompleto;
				this.alertService.error('Error', mensaje);
			}
		});
	}
}
