import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleFormPermissionMod } from '../../../../Core/Models/SecurityModule/RoleFormPermissionMod.model';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { FormService } from '../../../../Core/Service/SecurityModule/form.service';
import { PermissionService } from '../../../../Core/Service/SecurityModule/permission.service';
import { RoleService } from '../../../../Core/Service/SecurityModule/role.service';
import { BaseFormPivoteComponent } from '../../../../Components/SecurityModule/Base/base-form-pivote/base-form-pivote.component';
import { RoleFormPermissionService } from '../../../../Core/Service/SecurityModule/role-form-permission.service';

@Component({
  selector: 'app-update-role-form-permission',
  standalone: true,
  imports: [BaseFormPivoteComponent, CommonModule],
  templateUrl: './update-role-form-permission.component.html',
  styleUrl: './update-role-form-permission.component.css'
})
export class UpdateRoleFormPermissionComponent implements OnInit {

	// Inyección de servicios propios del proyecto
  private readonly roleFormPermissionService = inject(RoleFormPermissionService);
  private readonly roleService = inject(RoleService);
  private readonly formService = inject(FormService);
  private readonly permissionService = inject(PermissionService);

	// Inyección de servicios nativos de Angular
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  entity!: RoleFormPermissionMod;
  selectFields: any[] = [];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/securitymodule/RoleFormPermission']);
      return;
    }

    this.roleFormPermissionService.getById(id).subscribe({
      next: (data) => {
        this.entity = data;
        this.loadSelects();
      },
      error: (err) => {
        console.log('Error al Obtener RoleFormPermission:', err);
        const mensajeCompleto = err?.error?.message || 'Ocurrio un error inesperado.';
        const mensaje = mensajeCompleto.split(':')[1]?.trim() || mensajeCompleto;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje,
          confirmButtonText: 'Cerrar'
        })
      }
    });
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

  handleUpdateRoleFormPermission(data: any): void {
    this.roleFormPermissionService.update(data).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Usuer-Role actualizado ✅',
          confirmButtonText: 'Aceptar'
        });
        this.router.navigate(['/securitymodule/RoleFormPermission']);
      },
      error: (err) => {
        console.log('Error al actualizar RoleFormPermission:', err);
        const mensajeCompleto = err?.error?.message || 'Ocurrio un error inesperado.';
        const mensaje = mensajeCompleto.split(':')[1]?.trim() || mensajeCompleto;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje,
          confirmButtonText: 'Cerrar'
        })
      }
    });
  }
}
