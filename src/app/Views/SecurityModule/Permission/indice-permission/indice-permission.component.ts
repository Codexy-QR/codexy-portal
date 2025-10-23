import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { BaseTableComponent } from '../../../../Components/SecurityModule/Base/base-table/base-table.component';
import { PermissionMod } from '../../../../Core/Models/SecurityModule/PermissionMod.model';
import { PermissionService } from '../../../../Core/Service/SecurityModule/permission.service';

@Component({
  selector: 'app-indice-permission',
  standalone: true,
  imports: [MatCardModule, BaseTableComponent, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './indice-permission.component.html',
  styleUrl: './indice-permission.component.css'
})
export class IndicePermissionComponent implements OnInit {

	// Inyección de servicios propios del proyecto
  private readonly permissionService = inject(PermissionService);

  private readonly router = inject(Router)

  permissionData : PermissionMod[] = [];
  columnasMostrar : string[] = [
    'N°', 'name', 'description', 'active'
  ];

  ngOnInit(): void {
    this.cargarPermissions();
  }

  cargarPermissions(): void {
    this.permissionService.getAllJWT().subscribe({
      next: (data) => {
        this.permissionData = data;
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

  eliminarPermission(permission: PermissionMod): void {
    Swal.fire({
      title: '¿Qué tipo de eliminación deseas?',
      text: `Permission: ${permission.name}`,
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
        this.permissionService.delete(permission.id, 0).subscribe(() => {
          Swal.fire('Eliminacion Logica ✅', '', 'success');
          this.cargarPermissions();
        });
      } else if (result.isDenied) {
        this.permissionService.delete(permission.id, 1).subscribe(() => {
          Swal.fire('Eliminacion Permanente ✅', '', 'success');
          this.cargarPermissions();
        });
      }
    });
  }

  editarPermission(permission: PermissionMod): void {
    this.router.navigate([`/securitymodule/Permission/Update/${permission.id}`]);
  }
}
