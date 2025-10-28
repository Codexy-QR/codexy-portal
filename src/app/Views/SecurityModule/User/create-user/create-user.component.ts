import { Component, inject, OnInit } from '@angular/core';
import { PersonService } from '../../../../Core/Service/SecurityModule/person.service';
import { UserService } from '../../../../Core/Service/SecurityModule/user.service';
import { PersonAvailableMod } from '../../../../Core/Models/SecurityModule/PersonMod.model';
import Swal from 'sweetalert2';
import { UserOptionsMod } from '../../../../Core/Models/SecurityModule/UserMod.model';
import { Router } from '@angular/router';
import { FormUserComponent } from '../../../../Components/SecurityModule/form-user/form-user.component';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [FormUserComponent],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent implements OnInit {

	// Inyección de servicios propios del proyecto
  private readonly userService = inject(UserService);
  private readonly personService = inject(PersonService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router);

  personsAvailable: PersonAvailableMod[] = [];

  ngOnInit(): void {
    this.personService.getAvailable().subscribe({
      next: (data) => this.personsAvailable = data,
      error: (err) => {
        console.log("Error al obtener PersonAvailable:", err);
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

  handleSaveUser(newUser: UserOptionsMod): void {
    // console.log(newUser);
    this.userService.create(newUser).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: `Creacion de ${newUser.username}✅`,
          confirmButtonText: 'Aceptar'
        })
        this.router.navigate(['/securitymodule/User']);
      },
      error: (err) =>{
        console.log('Error al Crear User:', err);
        const mensajeCompleto = err?.error?.message || 'Ocurrio un error inesperado.';
        const mensaje = mensajeCompleto.split(':')[1]?.trim() || mensajeCompleto;
        Swal.fire({
          title: 'Error',
          icon: 'error',
          text: mensaje,
          confirmButtonText: 'Aceptar'
        })
      }
    });
  }
}
