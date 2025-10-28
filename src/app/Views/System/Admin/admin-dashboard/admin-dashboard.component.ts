import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, delay, of } from 'rxjs';
import { LoaderComponent } from "../../../../Components/Shared/app-loader/app-loader.component";
import { KpiCardComponent } from '../../../../Components/Shared/kpi-card/kpi-card.component';
import { CategoryChartComponent } from "../../../../Components/System/Admin/Analytics/category-chart/category-chart.component";
import { StatusChartComponent } from "../../../../Components/System/Admin/Analytics/status-chart/status-chart.component";
import { UserService } from '../../../../Core/Service/SecurityModule/user.service';
import { DashboardService } from '../../../../Core/Service/System/Others/dashboard.service';
import { MatButtonModule } from '@angular/material/button';

type Rol = 'subadmins' | 'encargados' | 'verificadores' | 'operativos';

@Component({
	selector: 'app-admin-dashboard',
	standalone: true,
	imports: [
		CommonModule,
		MatIconModule,
		MatButtonModule,
		MatProgressSpinnerModule,
		KpiCardComponent,
		CategoryChartComponent,
		StatusChartComponent,
		LoaderComponent
	],
	templateUrl: './admin-dashboard.component.html',
	styleUrls: ['../../../../Components/Shared/Styles/dashboard-shared.css', './admin-dashboard.component.css']
})
export class AdminDashboardComponent {

// Inyección de servicios propios del proyecto
	private readonly userService = inject(UserService);
	private readonly dashboardService = inject(DashboardService);

	companyId: number | null = null;

	// KPIs
	totalSucursales = 0;
	totalZonas = 0;
	totalItems = 0;

	// Usuarios por rol
	usuariosPorRol: Record<Rol, number> = {
		subadmins: 0,
		encargados: 0,
		verificadores: 0,
		operativos: 0
	};

	// Gráficas
	itemsPorCategoria: Record<string, number> = {};
	itemsPorEstado: Record<string, number> = {};

	// Estados UI
	loading = true;
	error = false;
	errorMessage = '';

	ngOnInit(): void {
		this.userService.hasCompany().subscribe({
			next: (res) => {
				if (res.hasCompany && res.companyId) {
					this.companyId = res.companyId;
					this.loadDashboard(this.companyId);
				} else {
					this.loading = false;
				}
			},
			error: (err) => {
				this.handleError('Error obteniendo empresa del usuario: ' + err.message);
			}
		});
	}


	loadDashboard(companyId: number) {
		this.loading = true;
		this.error = false;
		this.errorMessage = '';

		this.dashboardService.getDashboardCompany(companyId).pipe(
			delay(1500), // Simula carga
			catchError(err => {
				this.handleError('Error cargando dashboard: ' + (err.message ?? err));
				return of(null); // Devolvemos observable vacío para que el subscribe siga
			})
		).subscribe(data => {
			if (!data) {
				// Ya entro a handleError
				return;
			}

			this.totalSucursales = data.totalBranches;
			this.totalZonas = data.totalZones;
			this.totalItems = data.totalItems;

			this.usuariosPorRol = {
				subadmins: data.usersByRole['SUBADMINISTRADOR'] ?? 0,
				encargados: data.usersByRole['ENCARGADO_ZONA'] ?? 0,
				verificadores: data.usersByRole['VERIFICADOR'] ?? 0,
				operativos: data.usersByRole['OPERATIVO'] ?? 0
			};

			this.itemsPorCategoria = data.itemsByCategory;
			this.itemsPorEstado = data.itemsByState;

			this.loading = false;
		});
	}


	get totalUsuarios(): number {
		return Object.values(this.usuariosPorRol).reduce((a, b) => a + b, 0);
	}

	getRoleKeys(): Rol[] {
		return Object.keys(this.usuariosPorRol) as Rol[];
	}

	getRoleIcon(role: Rol): string {
		const icons: Record<Rol, string> = {
			subadmins: 'admin_panel_settings',
			encargados: 'supervisor_account',
			verificadores: 'verified_user',
			operativos: 'engineering'
		};
		return icons[role];
	}

	getRoleLabel(role: Rol): string {
		const labels: Record<Rol, string> = {
			subadmins: 'Subadmins',
			encargados: 'Encargados',
			verificadores: 'Verificadores',
			operativos: 'Operativos'
		};
		return labels[role];
	}

	private handleError(message: string) {
		this.error = true;
		this.errorMessage = message;
		this.loading = false;
		console.error(message);
	}

	handleRetry() {
		if (this.companyId !== null) {
			this.loadDashboard(this.companyId);
		} else {
			this.handleError('No se encontró una empresa para reintentar');
		}
	}

}
