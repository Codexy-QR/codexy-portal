import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { BaseTableComponent } from '../../../../Components/SecurityModule/Base/base-table/base-table.component';
import { FormModuleMod } from '../../../../Core/Models/SecurityModule/FormModuleMod.model';
import { FormModuleService } from '../../../../Core/Service/SecurityModule/form-module.service';

@Component({
  selector: 'app-indice-formModule',
  standalone: true,
  imports: [MatCardModule, BaseTableComponent, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './indice-form-module.component.html',
  styleUrl: './indice-form-module.component.css'
})
export class IndiceFormModuleComponent implements OnInit {

	// Inyección de servicios propios del proyecto
  private readonly formModuleService = inject(FormModuleService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router)

  formModuleData : FormModuleMod[] = [];
  columnasMostrar : string[] = [
    'N°', 'formName', 'moduleName', 'active'
  ];

  ngOnInit(): void {
    this.cargarFormModules();
  }

  cargarFormModules(): void {
    this.formModuleService.getAllJWT().subscribe({
      next: (data) => {
        this.formModuleData = data;
        // console.log(data);
      },
      error: (err) => {
        console.log('Error al cargar los datos:', err);
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

  eliminarFormModule(formModule: FormModuleMod): void {
    Swal.fire({
      title: '¿Qué tipo de eliminación deseas?',
      text: `FormModule`,
      icon: 'warning',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Lógica',
      denyButtonText: 'Permanente',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      denyButtonColor: '#d33',
    }).then(result => {
      if (result.isConfirmed) {
        this.formModuleService.delete(formModule.id, 0).subscribe(() => {
          Swal.fire('Eliminacion Logica ✅', '', 'success');
          this.cargarFormModules();
        });
      } else if (result.isDenied) {
        this.formModuleService.delete(formModule.id, 1).subscribe(() => {
          Swal.fire('Eliminacion Permanente ✅', '', 'success');
          this.cargarFormModules();
        });
      }
    });
  }

  editarFormModule(formModule: FormModuleMod): void {
    this.router.navigate([`/securitymodule/FormModule/Update/${formModule.id}`]);
  }
}
