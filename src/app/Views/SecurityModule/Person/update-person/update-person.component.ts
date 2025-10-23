import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { FormPersonComponent } from '../../../../Components/SecurityModule/form-person/form-person.component';
import { PersonMod } from '../../../../Core/Models/SecurityModule/PersonMod.model';
import { PersonService } from '../../../../Core/Service/SecurityModule/person.service';

@Component({
  selector: 'app-update-person',
  standalone: true,
  imports: [FormPersonComponent],
  templateUrl: './update-person.component.html',
  styleUrl: './update-person.component.css'
})
export class UpdatePersonComponent {

	// Inyección de servicios propios del proyecto
  private readonly personService = inject(PersonService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  person: PersonMod | null = null;

  ngOnInit(): void {
    const personId = Number(this.route.snapshot.paramMap.get('id'));
    this.personService.getById(personId).subscribe({
      next: (data) => this.person = data,
      error: (err) => {
        console.log('Error al obtener Datos:', err);
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

  handleSavePerson(updatedPerson: PersonMod): void {
    if (!updatedPerson.id) return;
    // console.log(updatedPerson)
    this.personService.update(updatedPerson).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: `Actualizacion de ${updatedPerson.name} ✅`,
          confirmButtonText: 'Aceptar'
        })
        this.router.navigate(['/securitymodule/Person']);
      },
      error: (err) => {
        console.log('Error al actualizar Person:', err);
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
}
