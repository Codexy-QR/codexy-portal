import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { BaseTableComponent } from '../../../../Components/SecurityModule/Base/base-table/base-table.component';
import { RoleMod } from '../../../../Core/Models/SecurityModule/RoleMod.model';
import { RoleService } from '../../../../Core/Service/SecurityModule/role.service';

@Component({
  selector: 'app-indice-role',
  standalone: true,
  imports: [MatCardModule, BaseTableComponent, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './indice-role.component.html',
  styleUrl: './indice-role.component.css'
})
export class IndiceRoleComponent implements OnInit {

	// Inyección de servicios propios del proyecto
  private readonly roleService = inject(RoleService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router)

  roleData : RoleMod[] = [];
  columnasMostrar : string[] = [
    'N°', 'name', 'description', 'active'
  ];

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.roleService.getAllJWT().subscribe({
      next: (data) => {
        this.roleData = data;
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

  eliminarRole(role: RoleMod): void {
    Swal.fire({
      title: '¿Qué tipo de eliminación deseas?',
      text: `Role: ${role.name}`,
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
        this.roleService.delete(role.id, 0).subscribe(() => {
          Swal.fire('Eliminacion Logica ✅', '', 'success');
          this.cargarRoles();
        });
      } else if (result.isDenied) {
        this.roleService.delete(role.id, 1).subscribe(() => {
          Swal.fire('Eliminacion Permanente ✅', '', 'success');
          this.cargarRoles();
        });
      }
    });
  }

  editarRole(role: RoleMod): void {
    this.router.navigate([`/securitymodule/Role/Update/${role.id}`]);
  }
}
