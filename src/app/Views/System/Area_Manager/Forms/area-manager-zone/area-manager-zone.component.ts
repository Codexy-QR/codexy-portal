import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataField, ShowInfoEdificationComponent } from '../../../../../Components/Shared/Forms/show-info-edification/show-info-edification.component';
import { EditField, UpdateInfoEdificationComponent } from "../../../../../Components/Shared/Modals/update-info-edification/update-info-edification.component";
import { ZoneMod, ZonePartialUpdateMod } from '../../../../../Core/Models/System/ZoneMod.model';
import { AuthService } from '../../../../../Core/Service/Auth/auth.service';
import { KillEdificationService } from '../../../../../Core/Service/System/Others/kill-edification.service';
import { ZoneService } from '../../../../../Core/Service/System/zone.service';

@Component({
	selector: 'app-area-manager-zone',
	standalone: true,
	imports: [CommonModule, ShowInfoEdificationComponent, UpdateInfoEdificationComponent],
	templateUrl: './area-manager-zone.component.html',
	styleUrl: './area-manager-zone.component.css'
})
export class AreaManagerZoneComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly zoneService = inject(ZoneService)
	private readonly authService = inject(AuthService)
	private readonly killService = inject(KillEdificationService);


	// Inyección de servicios nativos de Angular
	private readonly router = inject(Router);


	// Signals para datos de zona y estado del modal
	zoneData = signal<ZoneMod | null>(null);
	isEditModalOpen = signal(false);

	idUser: number = 0;

	// Campos configurables para el componente genérico a mostrar
	zoneFields: DataField[] = [
		{ key: 'name', label: 'Nombre', icon: 'store' },
		{ key: 'description', label: 'Descripción', icon: 'description' },
		{ key: 'branchName', label: 'Sucursal', icon: 'store' },
	];

	// Campos para editar (con validadores)
	editFields: EditField[] = [
		{
			key: 'name',
			label: 'Nombre',
			type: 'text',
			validators: [Validators.required, Validators.minLength(3)]
		},
		{
			key: 'description',
			label: 'Descripción',
			type: 'text',
			validators: [Validators.required, Validators.minLength(5)]
		}
	];

	ngOnInit(): void {
		this.loadZoneData();
	}

	loadZoneData(): void {
		const userIdString = this.authService.getIdUser();
		this.idUser = parseInt(userIdString, 10);
		if (this.idUser) {
			this.zoneService.getByIdAreaManager(this.idUser).subscribe({
				next: (zone) => this.zoneData.set(zone),
				error: (error) => console.error('Error loading zone data:', error)
			});
		} else {
			console.warn('El usuario no tiene zone asociada.');
		}
	}

	// Servicio para guardar (usado por el modal genérico)
	saveZone(zoneData: ZonePartialUpdateMod): any {
		return this.zoneService.partialUpdate(zoneData);
	}

	get zone(): ZoneMod | null {
		return this.zoneData();
	}

	getBranchInitials(): string {
		const name = this.zoneData()?.name;
		return name ? name.charAt(0).toUpperCase() : 'E';
	}

	// Métodos para manejar el modal de edición
	openEditModal(): void {
		this.isEditModalOpen.set(true);
	}

	closeEditModal(): void {
		this.isEditModalOpen.set(false);
	}

	onCompanyUpdated(updatedZone: ZoneMod): void {
		this.zoneData.set(updatedZone);
		this.closeEditModal();
		this.loadZoneData();
	}

	// Método para manejar la eliminación
	async openDeleteModal(): Promise<void> {
		await this.killService.confirmAndDelete({
			entityName: 'zona',
			entityDisplayName: this.zoneData()?.name || 'Zona',
			deleteService: (id, strategy) => this.zoneService.delete(id, strategy),
			getId: () => this.zoneData()?.id || null,
			successRedirect: '/Login',
			requirePassword: true
		});
	}
}
