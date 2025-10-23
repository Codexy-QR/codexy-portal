import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { RoleService } from '../../../../Core/Service/SecurityModule/role.service';
import { FormService } from '../../../../Core/Service/SecurityModule/form.service';
import { PermissionService } from '../../../../Core/Service/SecurityModule/permission.service';
import { forkJoin } from 'rxjs';
import { BaseFormPivoteComponent } from '../../../../Components/SecurityModule/Base/base-form-pivote/base-form-pivote.component';
import { RoleFormPermissionService } from '../../../../Core/Service/SecurityModule/role-form-permission.service';

@Component({
  selector: 'app-create-role-form-permission',
  standalone: true,
  imports: [BaseFormPivoteComponent],
  templateUrl: './create-role-form-permission.component.html',
  styleUrl: './create-role-form-permission.component.css'
})
export class CreateRoleFormPermissionComponent implements OnInit {

	// Inyección de servicios propios del proyecto
  private readonly roleFormPermissionService = inject(RoleFormPermissionService);
  private readonly roleService = inject(RoleService);
  private readonly formService = inject(FormService);
  private readonly permissionService = inject(PermissionService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router);

  selectFields: any[] = [];

  ngOnInit(): void {
    this.loadSelects();
  }

  private loadSelects(): void {
    forkJoin({
      roles: this.roleService.getAll(),
      forms: this.formService.getAll(),
      permissions: this.permissionService.getAll(),
    }).subscribe({
      next: ({ forms, roles }) => {
        this.selectFields = [
          {
            label: 'Role',
            controlName: 'roleId',
            options: roles.map(role => ({ id: role.id, name: role.name }))
          },
          {
            label: 'Form',
            controlName: 'formId',
            options: forms.map(form => ({ id: form.id, name: form.name }))
          },
          {
            label: 'Permission',
            controlName: 'permissionId',
            options: forms.map(permission => ({ id: permission.id, name: permission.name }))
          },
        ];
      },
      error: (err) => {
        console.error('Error al cargar usuarios o roles:', err);
      }
    });
  }

  handleSaveRoleFormPermission(newRoleFormPermission: any): void {
    console.log(newRoleFormPermission)
    this.roleFormPermissionService.create(newRoleFormPermission).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: `Usuario-Rol creado ✅`,
          confirmButtonText: 'Aceptar'
        });
        this.router.navigate(['/securitymodule/RoleFormPermission']);
      },
      error: (err) => {
        console.log('Error al crear RoleFormPermission:', err);
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
