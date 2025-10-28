import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Validators } from '@angular/forms';
import { ProfileField, ShowInfoProfileComponent } from '../../../../../Components/Shared/Forms/show-info-profile/show-info-profile.component';
import { ChangePasswordModalComponent } from '../../../../../Components/Shared/Modals/change-password/change-password.component';
import { ProfileEditField, UpdateInfoProfileComponent } from '../../../../../Components/Shared/Modals/update-info-profile/update-info-profile.component';
import { PersonMod } from '../../../../../Core/Models/SecurityModule/PersonMod.model';
import { UserPartialUpdateMod } from '../../../../../Core/Models/SecurityModule/UserMod.model';
import { AuthService } from '../../../../../Core/Service/Auth/auth.service';
import { PersonService } from '../../../../../Core/Service/SecurityModule/person.service';
import { UserService } from '../../../../../Core/Service/SecurityModule/user.service';

@Component({
	selector: 'app-area-manager-profile',
	standalone: true,
	imports: [
		CommonModule,
		ShowInfoProfileComponent,
		UpdateInfoProfileComponent,
		ChangePasswordModalComponent
	],
	templateUrl: './area-manager-profile.component.html',
	styleUrl: './area-manager-profile.component.css'
})
export class AreaManagerProfileComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);
	private readonly personService = inject(PersonService);
	private readonly userService = inject(UserService);

	// Signals para datos del usuario y modales
	user = signal<PersonMod | null>(null);
	isEditModalOpen = signal(false);
	isPasswordModalOpen = signal(false);


	// Profile fields configuration
	profileFields: ProfileField[] = [
		{ key: 'name', label: 'Nombres', icon: 'person' },
		{ key: 'lastName', label: 'Apellidos', icon: 'person' },
		{ key: 'email', label: 'Correo Electrónico', icon: 'email' },
		{ key: 'phone', label: 'Teléfono Celular', icon: 'phone' },
		{
			key: 'documentType',
			label: 'Tipo Documento',
			icon: 'badge',
			formatter: (value) => this.getDocumentLabel(value)
		},
		{ key: 'documentNumber', label: 'Número Documento', icon: 'numbers' }
	];

	// Edit fields configuration
	editFields: ProfileEditField[] = [
		{
			key: 'name',
			label: 'Nombre',
			validators: [Validators.required]
		},
		{
			key: 'lastName',
			label: 'Apellidos',
			validators: [Validators.required]
		},
		{
			key: 'email',
			label: 'Correo Electrónico',
			type: 'email',
			validators: [Validators.required, Validators.email]
		},
		{
			key: 'phone',
			label: 'Teléfono',
			type: 'tel',
			validators: [Validators.required]
		},
		{
			key: 'username',
			label: 'Username',
			validators: [Validators.required, Validators.minLength(3), Validators.maxLength(50)]
		}
	];

	private readonly documentTypes: Record<string, string> = {
		'TI': 'Tarjeta de Identidad',
		'CC': 'Cédula de Ciudadanía',
		'CE': 'Cédula de Extranjería',
		'PP': 'Pasaporte'
	};

	ngOnInit(): void {
		this.loadUserData();
	}

	private loadUserData(): void {
		const personIdString = this.authService.getIdPerson();
		const userId = this.authService.getIdUser();
		const username = this.authService.getUsername();

		if (!personIdString || !userId) {
			console.error('No se pudieron obtener los IDs necesarios');
			return;
		}

		const personId = Number(personIdString);

		if (isNaN(personId) || personId <= 0) {
			console.error('ID de Person inválido');
			return;
		}

		this.personService.getById(personId).subscribe({
			next: (userData) => {
				if (userData) {
					const userWithCompleteData = {
						...userData,
						id: Number(userId),
						username: username
					};
					this.user.set(userWithCompleteData);
				}
			},
			error: (error) => {
				console.error('Error al cargar datos:', error);
			}
		});
	}

	saveProfile(userData: UserPartialUpdateMod): any {
		return this.userService.partialUpdate(userData);
	}

	getDocumentLabel(code: string | null | undefined): string {
		if (!code) return 'N/A';
		return this.documentTypes[code] ?? code;
	}

	getUserInitials(): string {
		const user = this.user();
		if (!user) return 'U';

		const name = user.name?.charAt(0) || '';
		const lastName = user.lastName?.charAt(0) || '';
		return (name + lastName).toUpperCase() || 'U';
	}

	getFormattedRole(): string {
		const role = this.authService.getRole();
		return role ? role.replace('_', ' ').toUpperCase() : 'USUARIO';
	}

	openEditModal(): void {
		this.isEditModalOpen.set(true);
	}

	openPasswordModal(): void {
		this.isPasswordModalOpen.set(true);
	}

	closeEditModal(): void {
		this.isEditModalOpen.set(false);
	}

	closePasswordModal(): void {
		this.isPasswordModalOpen.set(false);
	}

	onProfileUpdated(updatedUser: any): void {
		this.user.set(updatedUser);
		this.closeEditModal();
		this.loadUserData();
	}
	onPasswordChanged(): void {
		this.closePasswordModal();
	}
}
