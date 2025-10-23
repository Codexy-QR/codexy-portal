import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { BaseTableComponent } from '../../../../Components/SecurityModule/Base/base-table/base-table.component';
import { FormMod } from '../../../../Core/Models/SecurityModule/FormMod.model';
import { FormService } from '../../../../Core/Service/SecurityModule/form.service';
import { AlertTotalService } from '../../../../Core/Service/alert-total.service';

@Component({
	selector: 'app-indice-form',
	standalone: true,
	imports: [MatCardModule, BaseTableComponent, MatButtonModule, MatIconModule, RouterLink],
	templateUrl: './indice-form.component.html',
	styleUrl: './indice-form.component.css'
})
export class IndiceFormComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly alertService = inject(AlertTotalService);
	private readonly formService = inject(FormService);

	// Inyección de servicios nativos de Angular
	private readonly router = inject(Router)

	formData: FormMod[] = [];
	columnasMostrar: string[] = [
		'N°', 'name', 'description', 'active'
	];

	ngOnInit(): void {
		this.cargarForms();
	}

	cargarForms(): void {
		this.formService.getAllJWT().subscribe({
			next: (data) => {
				this.formData = data;
			},
			error: (err) => {
				console.log('Error al cargar los datos:', err);
				const mensajeCompleto = err?.error?.message || 'Ocurrió un error inesperado.';
				const mensaje = mensajeCompleto.split(':')[1]?.trim() || mensajeCompleto;

				this.alertService.error('Error', mensaje);
			}
		});
	}


	eliminarForm(form: FormMod): void {
		this.alertService.custom({
			title: '¿Qué tipo de eliminación deseas?',
			text: `Form: ${form.name}`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Lógica',
			cancelButtonText: 'Cancelar',
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#aaa'
		}).then(result => {
			if (result.isConfirmed) {
				this.alertService.withLoading(
					() => this.formService.delete(form.id, 0).toPromise(),
					{
						successTitle: 'Eliminación lógica ✅',
						successText: `${form.name} fue eliminado lógicamente`
					}
				).then(() => this.cargarForms());
			} else if (result.isDenied) {
				this.alertService.withLoading(
					() => this.formService.delete(form.id, 1).toPromise(),
					{
						successTitle: 'Eliminación permanente ✅',
						successText: `${form.name} fue eliminado permanentemente`
					}
				).then(() => this.cargarForms());
			}
		});
	}


	editarForm(form: FormMod): void {
		this.router.navigate([`/securitymodule/Form/Update/${form.id}`]);
	}
}
