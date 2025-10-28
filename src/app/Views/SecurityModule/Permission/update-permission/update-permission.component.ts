import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { BaseFormEntityComponent } from '../../../../Components/SecurityModule/Base/base-form-entity/base-form-entity.component';
import { PermissionMod } from '../../../../Core/Models/SecurityModule/PermissionMod.model';
import { PermissionService } from '../../../../Core/Service/SecurityModule/permission.service';

@Component({
  selector: 'app-update-permission',
  standalone: true,
  imports: [BaseFormEntityComponent],
  templateUrl: './update-permission.component.html',
  styleUrl: './update-permission.component.css'
})
export class UpdatePermissionComponent {

	// Inyección de servicios propios del proyecto
  private readonly permissionService = inject(PermissionService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  permission: PermissionMod | null = null;

  ngOnInit(): void {
    const permissionId = Number(this.route.snapshot.paramMap.get('id'));
    this.permissionService.getById(permissionId).subscribe({
      next: (data) => this.permission = data,
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

  handleSavePermission(updatedPermission: PermissionMod): void {
    if (!updatedPermission.id) return;
    // console.log(updatedPermission)
    this.permissionService.update(updatedPermission).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: `Actualizacion de ${updatedPermission.name} ✅`,
          confirmButtonText: 'Aceptar'
        })
        this.router.navigate(['/securitymodule/Permission']);
      },
      error: (err) => {
        console.log('Error al actualizar Permission:', err);
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
