import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserRoleMod } from '../../../../Core/Models/SecurityModule/UserRoleMod.model';
import { UserRoleService } from '../../../../Core/Service/SecurityModule/user-role.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../../../Core/Service/SecurityModule/role.service';
import { UserService } from '../../../../Core/Service/SecurityModule/user.service';
import { forkJoin } from 'rxjs';
import { BaseFormPivoteComponent } from '../../../../Components/SecurityModule/Base/base-form-pivote/base-form-pivote.component';

@Component({
  selector: 'app-update-user-role',
  standalone: true,
  imports: [BaseFormPivoteComponent, CommonModule],
  templateUrl: './update-user-role.component.html',
  styleUrl: './update-user-role.component.css'
})
export class UpdateUserRoleComponent implements OnInit {

	// Inyección de servicios propios del proyecto
  private readonly userRoleService = inject(UserRoleService);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);

	// Inyección de servicios nativos de Angular
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  entity!: UserRoleMod;
  selectFields: any[] = [];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/securitymodule/UserRole']);
      return;
    }

    this.userRoleService.getById(id).subscribe({
      next: (data) => {
        this.entity = data;
        this.loadSelects();
      },
      error: (err) => {
        console.log('Error al Obtener UserRole:', err);
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
      users: this.userService.getAll(),
      roles: this.roleService.getAll()
    }).subscribe({
      next: ({ users, roles }) => {
        this.selectFields = [
          {
            label: 'Usuario',
            controlName: 'userId',
            options: users.map(user => ({ id: user.id, name: user.username }))
          },
          {
            label: 'Rol',
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

  handleUpdateUserRole(data: any): void {
    this.userRoleService.update(data).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Usuer-Role actualizado ✅',
          confirmButtonText: 'Aceptar'
        });
        this.router.navigate(['/securitymodule/UserRole']);
      },
      error: (err) => {
        console.log('Error al actualizar UserRole:', err);
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
