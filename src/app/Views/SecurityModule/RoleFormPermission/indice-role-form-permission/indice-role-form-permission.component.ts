import { Component, inject, OnInit } from '@angular/core';
import { RoleFormPermissionMod } from '../../../../Core/Models/SecurityModule/RoleFormPermissionMod.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { BaseTableComponent } from '../../../../Components/SecurityModule/Base/base-table/base-table.component';
import { RoleFormPermissionService } from '../../../../Core/Service/SecurityModule/role-form-permission.service';

@Component({
  selector: 'app-indice-roleFormPermission',
  standalone: true,
  imports: [MatCardModule, BaseTableComponent, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './indice-role-form-permission.component.html',
  styleUrl: './indice-role-form-permission.component.css'
})
export class IndiceRoleFormPermissionComponent implements OnInit {

	// Inyección de servicios propios del proyecto
  private readonly roleFormPermissionService = inject(RoleFormPermissionService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router)

  roleFormPermissionData : RoleFormPermissionMod[] = [];
  columnasMostrar : string[] = [
    'N°', 'roleName', 'formName', 'permissionName', 'active'
  ];

  ngOnInit(): void {
    this.cargarRoleFormPermissions();
  }

  cargarRoleFormPermissions(): void {
    this.roleFormPermissionService.getAllJWT().subscribe({
      next: (data) => {
        this.roleFormPermissionData = data;
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

  eliminarRoleFormPermission(roleFormPermission: RoleFormPermissionMod): void {
    Swal.fire({
      title: '¿Qué tipo de eliminación deseas?',
      text: `RoleFormPermission`,
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
        this.roleFormPermissionService.delete(roleFormPermission.id, 0).subscribe(() => {
          Swal.fire('Eliminacion Logica ✅', '', 'success');
          this.cargarRoleFormPermissions();
        });
      } else if (result.isDenied) {
        this.roleFormPermissionService.delete(roleFormPermission.id, 1).subscribe(() => {
          Swal.fire('Eliminacion Permanente ✅', '', 'success');
          this.cargarRoleFormPermissions();
        });
      }
    });
  }

  editarRoleFormPermission(roleFormPermission: RoleFormPermissionMod): void {
    this.router.navigate([`/securitymodule/RoleFormPermission/Update/${roleFormPermission.id}`]);
  }
}
