import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { LoaderComponent } from '../../../../../Components/Shared/app-loader/app-loader.component';
import { ItemHistoryReportComponent } from "../../../../../Components/System/Area_Manager/Modals/item-history-report/item-history-report.component";
import { InventoriesTableComponent } from '../../../../../Components/System/Area_Manager/Reports/inventories-table/inventories-table.component';
import { ItemsEvolutionTableComponent } from '../../../../../Components/System/Area_Manager/Reports/items-evolution-table/items-evolution-table.component';
import { VerificationsTableComponent } from '../../../../../Components/System/Area_Manager/Reports/verifications-table/verifications-table.component';
import { ZoneReportHeaderComponent } from '../../../../../Components/System/Area_Manager/Reports/zone-report-header/zone-report-header.component';
import { ZoneSummaryComponent } from '../../../../../Components/System/Area_Manager/Reports/zone-summary/zone-summary.component';
import { InventoryReport, ItemEvolutionReport, VerificationReport, ZoneReport, ZoneReportFilters } from '../../../../../Core/Models/System/Others/ZoneReportsMod.model';
import { ZoneMod } from '../../../../../Core/Models/System/ZoneMod.model';
import { AuthService } from '../../../../../Core/Service/Auth/auth.service';
import { DownloadService } from '../../../../../Core/Service/System/Others/Reports/donwload.service';
import { FilterService } from '../../../../../Core/Service/System/Others/Reports/filter.service';
import { ZoneReportsService } from '../../../../../Core/Service/System/Others/Reports/zone-reports.service';
import { ZoneService } from '../../../../../Core/Service/System/zone.service';
import { AlertTotalService } from '../../../../../Core/Service/alert-total.service';

@Component({
	selector: 'app-zone-reports',
	standalone: true,
	imports: [
		CommonModule,
		MatIconModule,
		MatButtonModule,
		LoaderComponent,
		ItemHistoryReportComponent,
		// Sub-componentes
		ZoneReportHeaderComponent,
		ZoneSummaryComponent,
		InventoriesTableComponent,
		ItemsEvolutionTableComponent,
		VerificationsTableComponent,
	],
	templateUrl: './reports.component.html',
	styleUrls: ['./reports.component.css']
})
export class ZoneReportsComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);
	private readonly zoneService = inject(ZoneService);
	private readonly zoneReportsService = inject(ZoneReportsService);
	private readonly filterService = inject(FilterService)
	private readonly downloadService = inject(DownloadService);
	private readonly alertService = inject(AlertTotalService)

	// Signals para estados básicos del componente
	readonly loading = signal(true);
	readonly error = signal(false);
	readonly errorMessage = signal('');

	// Signal para almacenar dinámicamente el ID de la zona
	readonly zoneId = signal<number | null>(null);

	// Signals para el control del modal de historial
	readonly isHistoryModalOpen = signal(false);
	readonly selectedItemHistory = signal<ItemEvolutionReport | null>(null);

	// Signals para almacenar los datos principales del reporte
	private readonly _zoneReport = signal<ZoneReport>(this.getEmptyZoneReport());
	private readonly _inventories = signal<InventoryReport[]>([]);
	private readonly _items = signal<ItemEvolutionReport[]>([]);
	private readonly _verifications = signal<VerificationReport[]>([]);

	// Computed para exponer datos almacenados
	readonly zoneReport = computed(() => this._zoneReport());
	readonly inventories = computed(() => this._inventories());
	readonly items = computed(() => this._items());
	readonly verifications = computed(() => this._verifications());

	// Computed para obtener datos filtrados mediante el servicio
	readonly filteredInventories = computed(() =>
		this.filterService.filterInventories(this.inventories())
	);
	readonly filteredItems = computed(() =>
		this.filterService.filterItems(this.items())
	);
	readonly filteredVerifications = computed(() =>
		this.filterService.filterVerifications(this.verifications())
	);

	// Filtros (usando object reference para two-way binding)
	filters: ZoneReportFilters = {
		startDate: null,
		endDate: null,
		selectedStatus: []
	};

	ngOnInit(): void {
		this.loadZoneAndReports();
	}

	// Método principal que obtiene primero la zona del usuario
	loadZoneAndReports(): void {
		this.setLoadingState(true);

		const userId = parseInt(this.authService.getIdUser(), 10);

		if (isNaN(userId)) {
			this.setErrorState('ID de usuario no válido');
			return;
		}

		this.zoneService.getByIdAreaManager(userId).subscribe({
			next: (zone: ZoneMod) => {
				if (zone && zone.id) {
					this.zoneId.set(zone.id);
					this.loadReports();
				} else {
					this.setErrorState('No se encontró una zona asignada para este usuario');
				}
			},
			error: (error) => {
				console.error('Error loading user zone:', error);
				this.setErrorState('Error al cargar la zona del usuario');
			}
		});
	}

	// Método principal de carga de reportes
	loadReports(): void {
		const currentZoneId = this.zoneId();

		if (!currentZoneId) {
			this.setErrorState('No hay una zona asignada para cargar reportes');
			return;
		}

		this.setLoadingState(true);

		forkJoin({
			zoneReport: this.zoneReportsService.getZoneReport(currentZoneId, this.filters),
			inventories: this.zoneReportsService.getInventoryReports(currentZoneId, this.filters),
			items: this.zoneReportsService.getItemsEvolution(currentZoneId, this.filters),
			verifications: this.zoneReportsService.getVerificationReports(currentZoneId, this.filters)
		}).subscribe({
			next: (results) => {
				this._zoneReport.set(results.zoneReport);
				this._inventories.set(results.inventories);
				this._items.set(results.items);
				this._verifications.set(results.verifications);
				this.setLoadingState(false);
			},
			error: (error) => {
				console.error('Error loading reports:', error);
				this.setErrorState('Error al cargar los reportes');
			}
		});
	}


	// Event handlers
	onFiltersApplied(filters: ZoneReportFilters): void {
		this.filters = { ...filters };
		this.filterService.updateFilters(filters);
		console.log('Filtros aplicados:', this.filters);
		console.log('Datos filtrados:', {
			inventories: this.filteredInventories().length,
			items: this.filteredItems().length,
			verifications: this.filteredVerifications().length
		});
	}

	onStatusFilterChanged(selectedStatuses: string[]): void {
		this.filters.selectedStatus = [...selectedStatuses];
		this.filterService.updateFilters(this.filters);
	}

	onViewHistory(item: ItemEvolutionReport): void {
		this.selectedItemHistory.set(item);
		this.isHistoryModalOpen.set(true);
	}

	onItemSelected(item: ItemEvolutionReport): void {
		console.log('Item seleccionado:', item);
		// Implementar lógica adicional si es necesario
	}

	closeHistoryModal(): void {
		this.isHistoryModalOpen.set(false);
		this.selectedItemHistory.set(null);
	}

	// Métodos de exportación mejorados
	async onExportExcel(): Promise<void> {
		await this.exportFileWithLoading('excel', 'Excel');
	}

	async onExportPDF(): Promise<void> {
		await this.exportFileWithLoading('pdf', 'PDF');
	}

	private async exportFileWithLoading(format: 'excel' | 'pdf', formatName: string): Promise<void> {
		const currentZoneId = this.zoneId();
		if (!currentZoneId) {
			this.alertService.error('Error', 'No hay zona asignada para exportar');
			return;
		}

		try {
			await this.alertService.withLoading(
				async () => {
					// Determinar el observable correcto
					const exportObservable = format === 'excel'
						? this.zoneReportsService.exportToExcel(currentZoneId, this.filters)
						: this.zoneReportsService.exportToPdf(currentZoneId, this.filters);

					// Convertir a Promise y esperar
					const blob = await exportObservable.toPromise();

					// Descargar el archivo
					const fileExtension = format === 'excel' ? 'xlsx' : 'pdf';
					const fileName = `reporte_zona_${currentZoneId}_${new Date().getTime()}.${fileExtension}`;
					this.downloadService.downloadFile(blob!, fileName);
				},
				{
					loadingTitle: `Generando ${formatName}`,
					loadingText: 'Preparando archivo de exportación...',
					successTitle: '¡Éxito!',
					successText: `Exportación a ${formatName} completada exitosamente`,
					errorTitle: 'Error de exportación',
					errorText: 'No se pudo generar el archivo de exportación',
					showSuccessAlert: true
				}
			);
		} catch (error) {
			// El error ya es manejado automáticamente por withLoading
			console.error(`Error en exportación ${formatName}:`, error);
		}
	}


	// Métodos de utilidad para estados
	private setLoadingState(loading: boolean): void {
		this.loading.set(loading);
		if (loading) {
			this.error.set(false);
		}
	}

	private setErrorState(message: string): void {
		this.error.set(true);
		this.errorMessage.set(message);
		this.loading.set(false);
	}

	private getEmptyZoneReport(): ZoneReport {
		return {
			zoneInfo: { id: 0, name: '', totalItems: 0 },
			itemsByStatus: [],
			statusDistribution: {}
		};
	}
}
