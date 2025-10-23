import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { catchError, delay, of } from 'rxjs';
import { LoaderComponent } from '../../../../Components/Shared/app-loader/app-loader.component';
import { KpiCardComponent } from '../../../../Components/Shared/kpi-card/kpi-card.component';
import { CategoryChartComponent } from '../../../../Components/System/Admin/Analytics/category-chart/category-chart.component';
import { StatusChartComponent } from '../../../../Components/System/Admin/Analytics/status-chart/status-chart.component';
import { Inventory, RecentInventoriesComponent } from '../../../../Components/System/Subadmin/Analytics/recent-inventories/recent-inventories.component';
import { ZonaStatusChartComponent } from '../../../../Components/System/Subadmin/Analytics/zona-status-chart/zona-status-chart.component';
import { DashboardBranchModel, RecentInventoryMod, ZoneMod } from '../../../../Core/Models/System/Others/Dashboard.model';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';
import { BranchService } from '../../../../Core/Service/System/branch.service';
import { DashboardService } from './../../../../Core/Service/System/Others/dashboard.service';

@Component({
	selector: 'app-subadmin-dashboard',
	standalone: true,
	imports: [
		CommonModule,
		LoaderComponent,
		KpiCardComponent,
		CategoryChartComponent,
		StatusChartComponent,
		ZonaStatusChartComponent,
		RecentInventoriesComponent,
		MatIconModule
	],
	templateUrl: './subadmin-dashboard.component.html',
	styleUrls: ['../../../../Components/Shared/Styles/dashboard-shared.css','./subadmin-dashboard.component.css']
})
export class SubadminDashboardComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService)
	private readonly branchService = inject(BranchService);
	private readonly dashboardService = inject(DashboardService)

	loading = true;
	error = false;
	errorMessage = '';

	// Datos del Servicio
	sucursalNombre = '';
	branchId: number | null = null;

	totalZonas = 0;
	totalItems = 0;
	totalEncargados = 0;
	totalOperativos = 0;
	inventariosMes = 0;

	itemsPorCategoria: Record<string, number> = {};
	zonasPorEstado: Record<string, number> = {};
	itemsPorEstado: Record<string, number> = {};
	inventariosRecientes: Inventory[] = [];

	ngOnInit() {
		this.loadDashboardData();
	}

	loadDashboardData() {
		this.loading = true;
		this.error = false;
		this.errorMessage = '';

		const userIdString = this.authService.getIdUser();
		const idUser = parseInt(userIdString, 10);

		if (isNaN(idUser)) {
			this.handleError('ID de usuario no válido');
			return;
		}

		this.branchService.getByIdInCharge(idUser).pipe(
			delay(1500),
			catchError(error => {
				this.handleError('Error al obtener la sucursal: ' + error.message);
				return of(null);
			})
		).subscribe(branch => {
			if (!branch) {
				this.handleError('No se pudo obtener la sucursal');
				return;
			}

			this.branchId = branch.id;
			this.sucursalNombre = branch.name;

			this.dashboardService.getDashboardBranch(this.branchId).pipe(
				catchError(error => {
					this.handleError('Error al cargar el dashboard: ' + error.message);
					return of(null);
				})
			).subscribe(dashboardData => {
				if (!dashboardData) {
					this.handleError('No se pudieron cargar los datos del dashboard');
					return;
				}

				this.processDashboardData(dashboardData);
				this.loading = false;
			});
		});
	}

	private processDashboardData(data: DashboardBranchModel) {
		// KPIs
		this.totalZonas = data.totalZones;
		this.totalItems = data.totalItems;
		this.totalEncargados = data.totalZoneManagers;
		this.totalOperativos = data.totalOperatives;
		this.inventariosMes = data.inventoriesThisMonth;

		// Gráficos
		this.itemsPorCategoria = data.itemsByCategory;
		this.itemsPorEstado = data.itemsByState;

		// Procesar estados de zonas
		this.zonasPorEstado = this.processZoneStates(data.zones);

		// Procesar inventarios recientes
		this.inventariosRecientes = this.processRecentInventories(data.recentInventories);
	}

	private processZoneStates(zones: ZoneMod[]): Record<string, number> {
		const estados: Record<string, number> = {};

		zones.forEach(zone => {
			// Mapear los estados del backend a los que espera nuestro componente
			let estadoVisual = 'Disponible'; // Valor por defecto

			switch (zone.state) {
				case 'Available':
					estadoVisual = 'Disponible';
					break;
				case 'InInventory':
					estadoVisual = 'En Inventario';
					break;
				case 'InVerification':
					estadoVisual = 'En Verificación';
					break;
				default:
					estadoVisual = zone.state;
			}

			if (estados[estadoVisual]) {
				estados[estadoVisual]++;
			} else {
				estados[estadoVisual] = 1;
			}
		});

		return estados;
	}

	private processRecentInventories(inventories: RecentInventoryMod[]): Inventory[] {
		return inventories.map(inv => ({
			fecha: this.formatDate(inv.date),
			zona: inv.zoneName,
			grupoOperativo: inv.operatingGroupName,
			estado: inv.verificationResult ? 'Aprobado' : 'NoAprobado'
		}));
	}

	private formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	private handleError(message: string) {
		this.error = true;
		this.errorMessage = message;
		this.loading = false;
		console.error(message);
	}
}
