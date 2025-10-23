import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BaseFormEntityComponent } from '../../../../Components/SecurityModule/Base/base-form-entity/base-form-entity.component';
import { FormMod } from '../../../../Core/Models/SecurityModule/FormMod.model';
import { FormService } from '../../../../Core/Service/SecurityModule/form.service';
import { AlertTotalService } from '../../../../Core/Service/alert-total.service';

@Component({
	selector: 'app-create-form',
	standalone: true,
	imports: [BaseFormEntityComponent],
	templateUrl: './create-form.component.html',
	styleUrl: './create-form.component.css'
})
export class CreateFormComponent {

	// Inyección de servicios propios del proyecto
	private readonly alertService = inject(AlertTotalService);
	private readonly formService = inject(FormService);

	// Inyección de servicios nativos de Angular
	private readonly router = inject(Router);


	handleSaveForm(newForm: FormMod): void {
  this.formService.create(newForm).subscribe({
    next: () => {
      this.alertService.success('Creación exitosa', `Se creó ${newForm.name} ✅`)
        .then(() => {
          this.router.navigate(['/securitymodule/Form']);
        });
    },
    error: (err) => {
      console.log('Error al crear Form:', err);
      const mensajeCompleto = err?.error?.message || 'Ocurrió un error inesperado.';
      const mensaje = mensajeCompleto.split(':')[1]?.trim() || mensajeCompleto;

      this.alertService.error('Error', mensaje);
    }
  });
}

}
