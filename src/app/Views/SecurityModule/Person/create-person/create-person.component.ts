import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormPersonComponent } from '../../../../Components/SecurityModule/form-person/form-person.component';
import { PersonMod } from '../../../../Core/Models/SecurityModule/PersonMod.model';
import { PersonService } from '../../../../Core/Service/SecurityModule/person.service';

@Component({
  selector: 'app-create-person',
  standalone: true,
  imports: [FormPersonComponent],
  templateUrl: './create-person.component.html',
  styleUrl: './create-person.component.css'
})
export class CreatePersonComponent {

	// Inyección de servicios propios del proyecto
  private readonly personService = inject(PersonService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router);

  handleSavePerson(newPerson: PersonMod): void {
    // console.log(newPerson)
    this.personService.create(newPerson).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: `Creacion de ${newPerson.name} ✅`,
          confirmButtonText: 'Aceptar'
        })
        this.router.navigate(['/securitymodule/Person']);
      },
      error: (err) => {
        console.log('Error al crear Person:', err);
        const mensajeCompleto = err?.error?.message || 'Ocurrio un error inesperado.';
        const mensaje = mensajeCompleto.split(':')[1]?.trim() || mensajeCompleto;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje,
          confirmButtonText: 'Aceptar'
        });;
      }
    });
  }
}
