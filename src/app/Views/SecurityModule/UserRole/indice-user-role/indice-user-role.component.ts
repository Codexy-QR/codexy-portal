import { Component, inject, OnInit } from '@angular/core';
import { UserRoleMod } from '../../../../Core/Models/SecurityModule/UserRoleMod.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { UserRoleService } from '../../../../Core/Service/SecurityModule/user-role.service';
import { BaseTableComponent } from '../../../../Components/SecurityModule/Base/base-table/base-table.component';

@Component({
  selector: 'app-indice-userRole',
  standalone: true,
  imports: [MatCardModule, BaseTableComponent, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './indice-user-role.component.html',
  styleUrl: './indice-user-role.component.css'
})
export class IndiceUserRoleComponent implements OnInit {

	// Inyección de servicios propios del proyecto
  private readonly userRoleService = inject(UserRoleService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router)

  userRoleData : UserRoleMod[] = [];
  columnasMostrar : string[] = [
    'N°', 'userName', 'roleName', 'active'
  ];

  ngOnInit(): void {
    this.cargarUserRoles();
  }

  cargarUserRoles(): void {
    this.userRoleService.getAllJWT().subscribe({
      next: (data) => {
        this.userRoleData = data;
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

  eliminarUserRole(userRole: UserRoleMod): void {
    Swal.fire({
      title: '¿Qué tipo de eliminación deseas?',
      text: `UserRole`,
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
        this.userRoleService.delete(userRole.id, 0).subscribe(() => {
          Swal.fire('Eliminacion Logica ✅', '', 'success');
          this.cargarUserRoles();
        });
      } else if (result.isDenied) {
        this.userRoleService.delete(userRole.id, 1).subscribe(() => {
          Swal.fire('Eliminacion Permanente ✅', '', 'success');
          this.cargarUserRoles();
        });
      }
    });
  }

  editarUserRole(userRole: UserRoleMod): void {
    this.router.navigate([`/securitymodule/UserRole/Update/${userRole.id}`]);
  }
}
