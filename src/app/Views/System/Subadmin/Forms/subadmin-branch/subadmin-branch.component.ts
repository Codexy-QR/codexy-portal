import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataField, ShowInfoEdificationComponent } from '../../../../../Components/Shared/Forms/show-info-edification/show-info-edification.component';
import { EditField, UpdateInfoEdificationComponent } from "../../../../../Components/Shared/Modals/update-info-edification/update-info-edification.component";
import { BranchMod, BranchPartialUpdateMod } from '../../../../../Core/Models/System/BranchMod.model';
import { AuthService } from '../../../../../Core/Service/Auth/auth.service';
import { BranchService } from '../../../../../Core/Service/System/branch.service';
import { KillEdificationService } from '../../../../../Core/Service/System/Others/kill-edification.service';
import { mixedPhoneValidator } from '../../../../../Core/Utils/input-validators.utils';

@Component({
	selector: 'app-subadmin-branch',
	standalone: true,
	imports: [CommonModule, ShowInfoEdificationComponent, UpdateInfoEdificationComponent],
	templateUrl: './subadmin-branch.component.html',
	styleUrl: './subadmin-branch.component.css'
})
export class SubadminBranchComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService)
	private readonly branchService = inject(BranchService)
	private readonly killService = inject(KillEdificationService);


	// Inyección de servicios nativos de Angular
	private readonly router = inject(Router)

	// Signals para datos de sucursal y control del modal
	branchData = signal<BranchMod | null>(null);
	isEditModalOpen = signal(false);

	idUser: number = 0;

	// Campos configurables para el componente genérico a mostrar
	branchFields: DataField[] = [
		{ key: 'name', label: 'Nombre', icon: 'store' },
		{ key: 'address', label: 'Direccion', icon: 'home_pin' },
		{ key: 'phone', label: 'Teléfono', icon: 'phone' },
		{ key: 'companyName', label: 'Empresa', icon: 'apartment' },
	];

	// Campos para editar (con validadores)
	editFields: EditField[] = [
		{
			key: 'phone',
			label: 'Telefono',
			type: 'text',
			validators: [Validators.required, mixedPhoneValidator()]
		},
	];

	ngOnInit(): void {
		this.loadBranchData();
	}

	loadBranchData(): void {
		const userIdString = this.authService.getIdUser();
		this.idUser = parseInt(userIdString, 10);
		if (this.idUser) {
			this.branchService.getByIdInCharge(this.idUser).subscribe({
				next: (branch) => this.branchData.set(branch),
				error: (error) => console.error('Error loading branch data:', error)
			});
		} else {
			console.warn('El usuario no tiene branch asociada.');
		}
	}

	// Servicio para guardar (usado por el modal genérico)
	saveBranch(branchData: BranchPartialUpdateMod): any {
		return this.branchService.partialUpdate(branchData);
	}

	get branch(): BranchMod | null {
		return this.branchData();
	}

	getCompanyInitials(): string {
		const name = this.branchData()?.name;
		return name ? name.charAt(0).toUpperCase() : 'E';
	}

	// Métodos para manejar el modal de edición
	openEditModal(): void {
		this.isEditModalOpen.set(true);
	}

	closeEditModal(): void {
		this.isEditModalOpen.set(false);
	}

	onCompanyUpdated(updatedBranch: BranchMod): void {
		this.branchData.set(updatedBranch);
		this.closeEditModal();
		this.loadBranchData();
	}

	// Método para manejar la eliminación
	async openDeleteModal(): Promise<void> {
		await this.killService.confirmAndDelete({
			entityName: 'sucursal',
			entityDisplayName: this.branchData()?.name || 'Sucursal',
			deleteService: (id, strategy) => this.branchService.delete(id, strategy),
			getId: () => this.branchData()?.id || null, // ← Este es síncrono
			successRedirect: '/Login',
			requirePassword: true
		});
	}
}
