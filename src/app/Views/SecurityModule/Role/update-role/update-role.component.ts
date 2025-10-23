import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import Swal from 'sweetalert2';
import { BaseFormEntityComponent } from '../../../../Components/SecurityModule/Base/base-form-entity/base-form-entity.component';
import { RoleMod } from '../../../../Core/Models/SecurityModule/RoleMod.model';
import { RoleService } from '../../../../Core/Service/SecurityModule/role.service';

@Component({
  selector: 'app-update-role',
  standalone: true,
  imports: [BaseFormEntityComponent],
  templateUrl: './update-role.component.html',
  styleUrl: './update-role.component.css'
})
export class UpdateRoleComponent {

	// Inyección de servicios propios del proyecto
  private readonly roleService = inject(RoleService);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  role: RoleMod | null = null;

  ngOnInit(): void {
    const roleId = Number(this.route.snapshot.paramMap.get('id'));
    this.roleService.getById(roleId).subscribe({
      next: (data) => this.role = data,
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

  handleSaveRole(updatedRole: RoleMod): void {
    if (!updatedRole.id) return;
    // console.log(updatedRole)
    this.roleService.update(updatedRole).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: `Actualizacion de ${updatedRole.name} ✅`,
          confirmButtonText: 'Aceptar'
        })
        this.router.navigate(['/securitymodule/Role']);
      },
      error: (err) => {
        console.log('Error al actualizar Role:', err);
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
