import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { BaseFormEntityComponent } from '../../../../Components/SecurityModule/Base/base-form-entity/base-form-entity.component';
import { PermissionMod } from '../../../../Core/Models/SecurityModule/PermissionMod.model';
import { PermissionService } from '../../../../Core/Service/SecurityModule/permission.service';

@Component({
  selector: 'app-create-permission',
  standalone: true,
  imports: [BaseFormEntityComponent],
  templateUrl: './create-permission.component.html',
  styleUrl: './create-permission.component.css'
})
export class CreatePermissionComponent {

	// Inyección de servicios propios del proyecto
  private readonly permissionService = inject(PermissionService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router);

  handleSavePermission(newPermission: PermissionMod): void {
      // console.log(newPermission)
      this.permissionService.create(newPermission).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: `Creacion de ${newPermission.name} ✅`,
            confirmButtonText: 'Aceptar'
          })
          this.router.navigate(['/securitymodule/Permission']);
        },
        error: (err) => {
          console.log('Error al crear Permission:', err);
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
