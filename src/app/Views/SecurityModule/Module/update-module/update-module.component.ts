import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { BaseFormEntityComponent } from '../../../../Components/SecurityModule/Base/base-form-entity/base-form-entity.component';
import { ModuleMod } from '../../../../Core/Models/SecurityModule/ModuleMod.model';
import { ModuleService } from '../../../../Core/Service/SecurityModule/module.service';

@Component({
  selector: 'app-update-module',
  standalone: true,
  imports: [BaseFormEntityComponent],
  templateUrl: './update-module.component.html',
  styleUrl: './update-module.component.css'
})
export class UpdateModuleComponent {

	// Inyección de servicios propios del proyecto
  private readonly moduleService = inject(ModuleService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  module: ModuleMod | null = null;

  ngOnInit(): void {
    const moduleId = Number(this.route.snapshot.paramMap.get('id'));
    this.moduleService.getById(moduleId).subscribe({
      next: (data) => this.module = data,
      error: (err) => {
        console.log('Error al obtener Datos:', err);
        const mensajeCompleto = err?.error?.message || 'Ocurrio un error inesperado.';
        const mensaje = mensajeCompleto.split(':')[1]?.trim() || mensajeCompleto;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  handleSaveModule(updatedModule: ModuleMod): void {
    if (!updatedModule.id) return;
    // console.log(updatedModule)
    this.moduleService.update(updatedModule).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: `Actualizacion de ${updatedModule.name} ✅`,
          confirmButtonText: 'Aceptar'
        })
        this.router.navigate(['/securitymodule/Module']);
      },
      error: (err) => {
        console.log('Error al actualizar Module:', err);
        const mensajeCompleto = err?.error?.message || 'Ocurrio un error inesperado.';
        const mensaje = mensajeCompleto.split(':')[1]?.trim() || mensajeCompleto;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }
}
