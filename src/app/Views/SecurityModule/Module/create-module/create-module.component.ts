import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { BaseFormEntityComponent } from '../../../../Components/SecurityModule/Base/base-form-entity/base-form-entity.component';
import { ModuleMod } from '../../../../Core/Models/SecurityModule/ModuleMod.model';
import { ModuleService } from '../../../../Core/Service/SecurityModule/module.service';

@Component({
  selector: 'app-create-module',
  standalone: true,
  imports: [BaseFormEntityComponent],
  templateUrl: './create-module.component.html',
  styleUrl: './create-module.component.css'
})
export class CreateModuleComponent {

	// Inyección de servicios propios del proyecto
  private readonly moduleService = inject(ModuleService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router);

  handleSaveModule(newModule: ModuleMod): void {
      // console.log(newModule)
      this.moduleService.create(newModule).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: `Creacion de ${newModule.name} ✅`,
            confirmButtonText: 'Aceptar'
          })
          this.router.navigate(['/securitymodule/Module']);
        },
        error: (err) => {
          console.log('Error al crear Module:', err);
          const mensajeCompleto = err?.error?.message || 'Ocurrio un error inesperado.';
          const mensaje = mensajeCompleto.split(':')[1]?.trim() || mensajeCompleto;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensaje,
            confirmButtonText: 'Aceptar'
          });;
        }
      });
    }
}
