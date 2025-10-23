import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShowStaffComponent, TableConfig } from '../../../../Components/Shared/Tables/show-staff/show-staff.component';
import { ZoneInChargesMod } from '../../../../Core/Models/System/ZoneMod.model';
import { BranchService } from '../../../../Core/Service/System/branch.service';
import { ZoneService } from '../../../../Core/Service/System/zone.service';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';
import { catchError, of } from 'rxjs';

@Component({
	selector: 'app-admin-subadmins',
	standalone: true,
	imports: [ShowStaffComponent],
	templateUrl: './subadmin-areaManagers.component.html'
})
export class SubadminAreaManagersComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);
	private readonly branchService = inject(BranchService);
	private readonly zoneService = inject(ZoneService);

	// Inyección de servicios nativos de Angular
	private readonly router = inject(Router);

	// Variables de estado y control local
	loading = true;
	error = false;
	errorMessage = '';
	areaManagers: ZoneInChargesMod[] = [];
	branchId: number | null = null;

	// Configuración para la tabla genérica
	tableConfig: TableConfig = {
		title: 'Encargados de Zona',
		subtitle: 'Gestión de usuarios con permisos de Encargado de Zona',
		emptyState: {
			icon: 'admin_panel_settings',
			title: 'No hay encargados de Zona',
			description: 'Para tener encargados de Zona, primero debes crear zonas y asignarles usuarios.',
			buttonText: 'Crear Zona',
			buttonIcon: 'add_location_alt',
			buttonAction: () => this.navigateToZones()
		},
		columns: [
			{ key: 'fullName', label: 'Nombre Completo', type: 'text' },
			{
				key: 'phone',
				label: 'Teléfono Celular',
				type: 'icon',
				icon: 'phone',
				formatter: (value) => value || 'No especificado'
			},
			{
				key: 'zoneName',
				label: 'Zona Asignada',
				type: 'icon',
				icon: 'map',
				formatter: (value) => value || 'Sin asignar'
			}
		],
		modalSections: [
			{
				title: 'Información Personal',
				icon: 'person',
				fields: [
					{ key: 'fullName', label: 'Nombre completo' },
					{ key: 'email', label: 'Email' },
					{ key: 'phone', label: 'Teléfono Celular' }
				]
			},
			{
				title: 'Documentación',
				icon: 'badge',
				fields: [
					{
						key: 'documentType',
						label: 'Tipo de documento',
						formatter: (value) => this.getDocumentTypeName(value)
					},
					{ key: 'documentNumber', label: 'Número de documento' }
				]
			},
			{
				title: 'Zona Asignada',
				icon: 'map',
				fields: [{ key: 'zoneName', label: 'Zona' }]
			}
		]
	};


	documentTypeMap: { [key: string]: string } = {
		RC: 'Registro Civil',
		TI: 'Tarjeta de Identidad',
		CC: 'Cédula de Ciudadanía',
		CE: 'Cédula de Extranjería',
		PP: 'Pasaporte'
	};

	// Métodos del ciclo de vida del componente
	ngOnInit(): void {
		this.loadBranchForUser();
	}

	private loadBranchForUser(): void {
		const userIdString = this.authService.getIdUser();

		if (!userIdString) {
			this.error = false;
			this.loading = false;
			return;
		}

		const idUser = parseInt(userIdString, 10);
		if (isNaN(idUser)) {
			this.error = false;
			this.loading = false;
			return;
		}

		this.branchService.getByIdInCharge(idUser).pipe(
			catchError((error) => {
				this.handleError(`Error al obtener la sucursal: ${error.message || error}`);
				this.loading = false;
				return of(null);
			})
		).subscribe((branch) => {
			if (!branch || !branch.id) {
				this.handleError('No se pudo obtener la sucursal del usuario');
				this.loading = false;
				return;
			}

			this.branchId = branch.id;
			this.getInCharges();
		});
	}

	private getInCharges(): void {
		if (this.branchId == null) {
			this.handleError('No se encontró una sucursal válida');
			this.loading = false;
			return;
		}

		this.loading = true;
		this.zoneService.getInCharges(this.branchId).subscribe({
			next: (areaManagers) => {
				this.areaManagers = areaManagers;
				this.loading = false;
			},
			error: (error) => {
				this.handleError(`Error al cargar los encargados: ${error.message || error}`);
				this.loading = false;
			}
		});
	}

	getDocumentTypeName(code: string | undefined | null): string {
		return code ? (this.documentTypeMap[code] || code) : '';
	}

	navigateToZones(): void {
		this.router.navigate(['/subadmin/register-zone']);
	}

	onRowClick(areaManager: any): void {
		console.log('Encargado de zona seleccionado:', areaManager);
	}

	private handleError(message: string) {
		this.error = true;
		this.errorMessage = message;
		this.loading = false;
		console.error(message);
	}
}
