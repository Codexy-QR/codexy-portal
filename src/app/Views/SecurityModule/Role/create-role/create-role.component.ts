import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { BaseFormEntityComponent } from '../../../../Components/SecurityModule/Base/base-form-entity/base-form-entity.component';
import { RoleMod } from '../../../../Core/Models/SecurityModule/RoleMod.model';
import { RoleService } from '../../../../Core/Service/SecurityModule/role.service';

@Component({
  selector: 'app-create-role',
  standalone: true,
  imports: [BaseFormEntityComponent],
  templateUrl: './create-role.component.html',
  styleUrl: './create-role.component.css'
})
export class CreateRoleComponent {

	// Inyección de servicios propios del proyecto
  private readonly roleService = inject(RoleService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router);

  handleSaveRole(newRole: RoleMod): void {
      // console.log(newRole)
      this.roleService.create(newRole).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: `Creacion de ${newRole.name} ✅`,
            confirmButtonText: 'Aceptar'
          })
          this.router.navigate(['/securitymodule/Role']);
        },
        error: (err) => {
          console.log('Error al crear Role:', err);
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
