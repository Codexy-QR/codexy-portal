import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { BaseFormPivoteComponent } from '../../../../Components/SecurityModule/Base/base-form-pivote/base-form-pivote.component';
import { FormModuleService } from '../../../../Core/Service/SecurityModule/form-module.service';
import { FormService } from '../../../../Core/Service/SecurityModule/form.service';
import { ModuleService } from '../../../../Core/Service/SecurityModule/module.service';

@Component({
  selector: 'app-create-form-module',
  standalone: true,
  imports: [BaseFormPivoteComponent],
  templateUrl: './create-form-module.component.html',
  styleUrl: './create-form-module.component.css'
})
export class CreateFormModuleComponent implements OnInit {

	// Inyección de servicios propios del proyecto
  private readonly formModuleService = inject(FormModuleService);
  private readonly moduleService = inject(ModuleService);
  private readonly formService = inject(FormService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router);

  selectFields: any[] = [];

  ngOnInit(): void {
    this.loadSelects();
  }

  private loadSelects(): void {
    forkJoin({
      forms: this.formService.getAll(),
      modules: this.moduleService.getAll()
    }).subscribe({
      next: ({ forms, modules }) => {
        this.selectFields = [
          {
            label: 'Form',
            controlName: 'formId',
            options: forms.map(form => ({ id: form.id, name: form.name }))
          },
          {
            label: 'Module',
            controlName: 'moduleId',
            options: modules.map(module => ({ id: module.id, name: module.name }))
          }
        ];
      },
      error: (err) => {
        console.error('Error al cargar usuarios o modules:', err);
      }
    });
  }

  handleSaveFormModule(newFormModule: any): void {
    console.log(newFormModule)
    this.formModuleService.create(newFormModule).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: `Usuario-Rol creado ✅`,
          confirmButtonText: 'Aceptar'
        });
        this.router.navigate(['/securitymodule/FormModule']);
      },
      error: (err) => {
        console.log('Error al crear FormModule:', err);
        const mensajeCompleto = err?.error?.message || 'Ocurrio un error inesperado.';
        const mensaje = mensajeCompleto.split(':')[1]?.trim() || mensajeCompleto;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje,
          confirmButtonText: 'Cerrar'
        });
      }
    });
  }
}
