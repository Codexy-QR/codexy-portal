import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../../../Core/Service/SecurityModule/user.service';
import { UserMod } from '../../../../Core/Models/SecurityModule/UserMod.model';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { BaseTableComponent } from '../../../../Components/SecurityModule/Base/base-table/base-table.component';

@Component({
  selector: 'app-indice-user',
  standalone: true,
  imports: [MatCardModule, BaseTableComponent, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './indice-user.component.html',
  styleUrl: './indice-user.component.css'
})
export class IndiceUserComponent implements OnInit {

	// Inyección de servicios propios del proyecto
  private readonly userService = inject(UserService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router)

  userData: UserMod[] = [];
  columnasMostrar : string[] = [
    'N°', 'username', 'password', 'personName', 'active'
  ];

  ngOnInit(): void {
    this.cargarUsers();
  }

  cargarUsers(): void {
    this.userService.getAllJWT().subscribe({
      next: (data) => {
        this.userData = data.map((user, index) => ({
          ...user,
          password: '🤡'
        }));
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


  eliminarUser(user: UserMod): void {
    Swal.fire({
      title: '¿Qué tipo de eliminación deseas?',
      text: `User: ${user.username}`,
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
        this.userService.delete(user.id, 0).subscribe(() => {
          Swal.fire('Eliminacion Logica ✅', '', 'success');
          this.cargarUsers();
        });
      } else if (result.isDenied) {
        this.userService.delete(user.id, 1).subscribe(() => {
          Swal.fire('Eliminacion Permanente ✅', '', 'success');
          this.cargarUsers();
        });
      }
    });
  }

  editarUser(user: UserMod): void {
    this.router.navigate([`/securitymodule/User/Update/${user.id}`]);
  }
}
