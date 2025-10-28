import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataField, ShowInfoEdificationComponent } from '../../../../../Components/Shared/Forms/show-info-edification/show-info-edification.component';
import { EditField, UpdateInfoEdificationComponent } from "../../../../../Components/Shared/Modals/update-info-edification/update-info-edification.component";
import { CompanyMod, CompanyPartialUpdateMod } from '../../../../../Core/Models/System/CompanyMod.model';
import { UserService } from '../../../../../Core/Service/SecurityModule/user.service';
import { CompanyService } from '../../../../../Core/Service/System/company.service';
import { KillEdificationService } from '../../../../../Core/Service/System/Others/kill-edification.service';
import { toPromise } from '../../../../../Core/Utils/auth.utils';

@Component({
	selector: 'app-admin-company',
	standalone: true,
	imports: [CommonModule, ShowInfoEdificationComponent, UpdateInfoEdificationComponent],
	templateUrl: './admin-company.component.html',
	styleUrl: './admin-company.component.css'
})
export class AdminCompanyComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly companyService = inject(CompanyService)
	private readonly userService = inject(UserService)
	private readonly killService = inject(KillEdificationService);

	// Inyección de servicios nativos de Angular
	private readonly router = inject(Router);

	// Signals para datos de la empresa y estado del modal
	companyData = signal<CompanyMod | null>(null);
	isEditModalOpen = signal(false);

	// Campos configurables para el componente genérico a mostrar
	companyFields: DataField[] = [
		{ key: 'name', label: 'Nombre Comercial', icon: 'store' },
		{ key: 'businessName', label: 'Razón Social', icon: 'corporate_fare' },
		{ key: 'nit', label: 'NIT', icon: 'badge' },
		{ key: 'industryName', label: 'Industria', icon: 'category' },
		{ key: 'email', label: 'Email Corporativo', icon: 'email' },
		{ key: 'webSite', label: 'Sitio Web', icon: 'language' },
	];

	// Campos para editar (con validadores)
	editFields: EditField[] = [
		{
			key: 'email',
			label: 'Email Corporativo',
			type: 'email',
			validators: [Validators.required, Validators.email]
		},
		{
			key: 'webSite',
			label: 'Sitio Web',
			validators: [Validators.maxLength(200)]
		}
	];

	ngOnInit(): void {
		this.loadCompanyData();
	}

	loadCompanyData(): void {
		this.userService.hasCompany().subscribe({
			next: (data) => {
				if (data.hasCompany && data.companyId) {
					this.companyService.getById(data.companyId).subscribe({
						next: (company) => this.companyData.set(company),
						error: (error) => console.error('Error loading company data:', error)
					});
				} else {
					console.warn('El usuario no tiene compañía asociada.');
				}
			},
			error: (error) => console.error('Error verificando compañía:', error)
		});
	}

	// Servicio para guardar (usado por el modal genérico)
	saveCompany(companyData: CompanyPartialUpdateMod): any {
		return this.companyService.partialUpdate(companyData);
	}


	getCompanyInitials(): string {
		const name = this.companyData()?.name;
		return name ? name.charAt(0).toUpperCase() : 'E';
	}

	// Getter para obtener el valor de la señal (para usar en el template)
	get company(): CompanyMod | null {
		return this.companyData();
	}
	// Métodos para manejar el modal de edición
	openEditModal(): void {
		this.isEditModalOpen.set(true);
	}

	closeEditModal(): void {
		this.isEditModalOpen.set(false);
	}

	onCompanyUpdated(updatedCompany: CompanyMod): void {
		this.companyData.set(updatedCompany);
		this.closeEditModal();
		this.loadCompanyData();
	}

	// Método para manejar la eliminación
	async openDeleteModal(): Promise<void> {
		await this.killService.confirmAndDelete({
			entityName: 'empresa',
			entityDisplayName: this.company?.name || 'Empresa',
			deleteService: (id, strategy) => this.companyService.delete(id, strategy),
			getId: async (): Promise<number | null> => {
				try {
					const data = await toPromise(this.userService.hasCompany());
					return data.hasCompany && data.companyId ? data.companyId : null;
				} catch (error) {
					console.error('Error obteniendo companyId:', error);
					return null;
				}
			},
			successRedirect: '/admin/welcome',
			requirePassword: true
		});
	}
}
