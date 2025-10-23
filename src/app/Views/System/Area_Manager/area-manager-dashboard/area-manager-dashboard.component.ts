import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { delay, switchMap } from 'rxjs';
import { LoaderComponent } from '../../../../Components/Shared/app-loader/app-loader.component';
import { KpiCardComponent } from '../../../../Components/Shared/kpi-card/kpi-card.component';
import { StatusChartComponent } from '../../../../Components/System/Admin/Analytics/status-chart/status-chart.component';
import { ZONE_STATE_ESPECIFIC_MAP } from '../../../../Core/Constants/zone-mapping';
import { ItemStatusMod, ZoneDashboard, ZoneInfoMod } from '../../../../Core/Models/System/Others/Dashboard.model';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';
import { CalculateStatusOpGroupService, OperatingGroup } from '../../../../Core/Service/System/Others/Operatives/calculate-status-opGroup.service';
import { DashboardService } from '../../../../Core/Service/System/Others/dashboard.service';
import { InventoryComparisonResult, InventoryComparisonService } from '../../../../Core/Service/System/Others/inventory-comparasion.service';
import { ZoneService } from '../../../../Core/Service/System/zone.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
	selector: 'app-area-manager-dashboard',
	standalone: true,
	imports: [
		CommonModule,
		MatIconModule,
		MatCardModule,
		MatButtonModule,
		MatTableModule,
		LoaderComponent,
		KpiCardComponent,
		StatusChartComponent
	],
	templateUrl: './area-manager-dashboard.component.html',
	styleUrls: ['../../../../Components/Shared/Styles/dashboard-shared.css', './area-manager-dashboard.component.css']
})
export class AreaManagerDashboardComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);
	private readonly inventoryComparisonService = inject(InventoryComparisonService);
	private readonly calculateStateOpGroupService = inject(CalculateStatusOpGroupService);
	private readonly zoneService = inject(ZoneService);
	private readonly dashboardService = inject(DashboardService);

	// Estados del componente
	loading = true;
	error = false;
	errorMessage = '';

	// Datos procesados para la UI
	zoneInfo: ZoneInfoMod = {} as ZoneInfoMod;
	itemsStatus: ItemStatusMod[] = [];
	inventoryComparison: InventoryComparisonResult[] = [];
	operatingGroups: OperatingGroup[] = [];

	// Estadísticas calculadas
	correctCount = 0;
	missingCount = 0;
	differentCount = 0;
	damagedCount = 0;
	scheduledGroupsCount = 0;
	inProgressGroupsCount = 0;
	completedGroupsCount = 0;

	// Para visualizaciones
	itemsByState: Record<string, number> = {};
	displayedColumns: string[] = ['itemName', 'category', 'expectedState', 'foundState', 'status'];

	ngOnInit(): void {
		this.loadDashboardData();
	}

	/**
	 * Carga los datos del dashboard desde el backend
	 */
	loadDashboardData(): void {
		this.loading = true;
		this.error = false;
		this.errorMessage = '';

		try {
			// Flujo: obtener ID del usuario → obtener zona → obtener datos del dashboard
			const userId = parseInt(this.authService.getIdUser());

			this.zoneService.getByIdAreaManager(userId)
				.pipe(
					delay(1500),
					switchMap(zone => {
						// Una vez obtenida la zona, obtener los datos del dashboard
						return this.dashboardService.getDashboardZone(zone.id);
					})
				)
				.subscribe({
					next: (dashboardData: ZoneDashboard) => {
						this.processDashboardData(dashboardData);
						this.loading = false;
					},
					error: (error) => {
						console.error('Error loading dashboard data:', error);
						this.handleError('Error al cargar los datos del dashboard');
					}
				});

		} catch (error) {
			console.error('Error en loadDashboardData:', error);
			this.handleError('Error al inicializar la carga de datos');
		}
	}

	/**
	 * Procesa todos los datos del dashboard recibidos del backend
	 */
	private processDashboardData(data: ZoneDashboard): void {
		// Guardar datos básicos
		this.zoneInfo = data.zoneInfo;
		this.itemsStatus = data.itemsStatus;

		// Procesar comparación de inventarios
		this.processInventoryData(data.inventoryComparison);

		// Procesar grupos operativos
		this.processOperatingGroupsData(data.operatingGroups);

		// Preparar datos para gráficos
		this.prepareChartData();
	}

	/**
	 * Procesa los datos de comparación de inventarios
	 */
	private processInventoryData(rawInventoryData: ZoneDashboard['inventoryComparison']): void {
		// Procesar la comparación con el servicio
		this.inventoryComparison = this.inventoryComparisonService.processInventoryComparison(rawInventoryData);

		// Calcular estadísticas usando el servicio
		const stats = this.inventoryComparisonService.getComparisonStatistics(this.inventoryComparison);
		this.correctCount = stats.correctCount;
		this.missingCount = stats.missingCount;
		this.differentCount = stats.differentCount;
		this.damagedCount = stats.damagedCount;
	}

	/**
	 * Procesa los datos de grupos operativos
	 */
	private processOperatingGroupsData(rawOperatingGroups: ZoneDashboard['operatingGroups']): void {
		// Procesar grupos con el servicio
		this.operatingGroups = this.calculateStateOpGroupService.processOperatingGroups(rawOperatingGroups);

		// Calcular estadísticas
		const groupStats = this.calculateStateOpGroupService.getGroupStatistics(this.operatingGroups);
		this.scheduledGroupsCount = groupStats.scheduledCount;
		this.inProgressGroupsCount = groupStats.inProgressCount;
		this.completedGroupsCount = groupStats.completedCount;

		// Ordenar por fecha de inicio
		this.operatingGroups = this.calculateStateOpGroupService.sortGroupsByStartDate(this.operatingGroups);
	}

	/**
	 * Prepara los datos para los gráficos
	 */
	private prepareChartData(): void {
		// Para el gráfico de estado de items (basado en inventario base)
		this.itemsByState = this.itemsStatus.reduce((acc, item) => {
			acc[item.state] = item.count;
			return acc;
		}, {} as Record<string, number>);
	}

	/**
	 * Método para refrescar los datos manualmente
	 */
	refreshData(): void {
		this.loadDashboardData();
	}

	/**
	 * Getter para estadísticas de grupos
	 */
	get groupStatistics() {
		return {
			scheduled: this.scheduledGroupsCount,
			inProgress: this.inProgressGroupsCount,
			completed: this.completedGroupsCount,
			total: this.operatingGroups.length
		};
	}

	/**
	 * Getter para el estado de la zona
	 */
	get zoneState() {
		return ZONE_STATE_ESPECIFIC_MAP[this.zoneInfo.state as keyof typeof ZONE_STATE_ESPECIFIC_MAP];
	}

	// ==================== MÉTODOS DE UI ====================

	getStatusIcon(status: string): string {
		switch (status) {
			case 'correct': return 'check_circle';
			case 'missing': return 'search_off';
			case 'different-state': return 'compare_arrows';
			case 'damaged': return 'warning';
			default: return 'help';
		}
	}

	getStatusClass(status: string): string {
		switch (status) {
			case 'correct': return 'status-correct';
			case 'missing': return 'status-missing';
			case 'different-state': return 'status-different';
			case 'damaged': return 'status-damaged';
			default: return 'status-unknown';
		}
	}

	getStatusLabel(status: string): string {
		switch (status) {
			case 'correct': return 'Correcto';
			case 'missing': return 'Faltante';
			case 'different-state': return 'Estado diferente';
			case 'damaged': return 'Dañado';
			default: return 'Desconocido';
		}
	}

	getGroupStatusIcon(status: string): string {
		switch (status) {
			case 'scheduled': return 'event';
			case 'in-progress': return 'pending_actions';
			case 'completed': return 'check_circle';
			default: return 'help';
		}
	}

	getGroupStatusClass(status: string): string {
		switch (status) {
			case 'scheduled': return 'group-scheduled';
			case 'in-progress': return 'group-in-progress';
			case 'completed': return 'group-completed';
			default: return 'group-unknown';
		}
	}

	getGroupStatusLabel(status: string): string {
		switch (status) {
			case 'scheduled': return 'Programado';
			case 'in-progress': return 'En progreso';
			case 'completed': return 'Completado';
			default: return 'Desconocido';
		}
	}

	formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	private handleError(message: string): void {
		this.error = true;
		this.errorMessage = message;
		this.loading = false;
		console.error(message);
	}
}
