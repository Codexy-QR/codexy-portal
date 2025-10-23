import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../Core/Service/SecurityModule/user.service';
import { UserOptionsMod } from '../../../../Core/Models/SecurityModule/UserMod.model';
import Swal from 'sweetalert2';
import { FormUserComponent } from '../../../../Components/SecurityModule/form-user/form-user.component';

@Component({
	selector: 'app-update-user',
	standalone: true,
	imports: [FormUserComponent],
	templateUrl: './update-user.component.html',
	styleUrl: './update-user.component.css'
})
export class UpdateUserComponent {

	// Inyección de servicios propios del proyecto
	private readonly userService = inject(UserService);

	// Inyección de servicios nativos de Angular
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);

	user: UserOptionsMod | null = null;

	ngOnInit(): void {
		const userId = Number(this.route.snapshot.paramMap.get('id'));
		this.userService.getById(userId).subscribe({
			next: (data) => this.user = data,
			error: (err) => {
				console.log('Error al actualizar Person:', err);
				const mensajeCompleto = err?.error?.message || 'Ocurrio un error inesperado.';
				const mensaje = mensajeCompleto.split(':')[1]?.trim() || mensajeCompleto
				Swal.fire({
					icon: 'error',
					title: 'Error',
					text: mensaje,
					confirmButtonText: 'Aceptar'
				});
			}
		});
	}

	handleSaveUser(updateUser: UserOptionsMod): void {
		if (!updateUser.id) return;
		// console.log(updateUser)
		this.userService.update(updateUser).subscribe({
			next: () => {
				Swal.fire({
					icon: 'success',
					title: `Actualizacion de ${updateUser.username} ✅`,
					confirmButtonText: 'Aceptar'
				})
				this.router.navigate(['/securitymodule/User']);
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
