import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { BaseFormPivoteComponent } from '../../../../Components/SecurityModule/Base/base-form-pivote/base-form-pivote.component';
import { RoleService } from '../../../../Core/Service/SecurityModule/role.service';
import { UserRoleService } from '../../../../Core/Service/SecurityModule/user-role.service';
import { UserService } from '../../../../Core/Service/SecurityModule/user.service';

@Component({
  selector: 'app-create-user-role',
  standalone: true,
  imports: [BaseFormPivoteComponent],
  templateUrl: './create-user-role.component.html',
  styleUrl: './create-user-role.component.css'
})
export class CreateUserRoleComponent implements OnInit {

	// Inyección de servicios propios del proyecto
  private readonly userRoleService = inject(UserRoleService);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);


  private router = inject(Router);

  selectFields: any[] = [];

  ngOnInit(): void {
    this.loadSelects();
  }

  private loadSelects(): void {
    forkJoin({
      users: this.userService.getAll(),
      roles: this.roleService.getAll()
    }).subscribe({
      next: ({ users, roles }) => {
        this.selectFields = [
          {
            label: 'User',
            controlName: 'userId',
            options: users.map(user => ({ id: user.id, name: user.username }))
          },
          {
            label: 'Role',
            controlName: 'roleId',
            options: roles.map(role => ({ id: role.id, name: role.name }))
          }
        ];
      },
      error: (err) => {
        console.error('Error al cargar usuarios o roles:', err);
      }
    });
  }

  handleSaveUserRole(newUserRole: any): void {
    console.log(newUserRole)
    this.userRoleService.create(newUserRole).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: `Usuario-Rol creado ✅`,
          confirmButtonText: 'Aceptar'
        });
        this.router.navigate(['/securitymodule/UserRole']);
      },
      error: (err) => {
        console.log('Error al crear UserRole:', err);
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
