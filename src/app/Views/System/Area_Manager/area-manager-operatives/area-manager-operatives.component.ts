import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { LoaderComponent } from '../../../../Components/Shared/app-loader/app-loader.component';
import { ImportExcelComponent } from '../../../../Components/System/Area_Manager/Modals/import-excel/import-excel.component';
import { OperativesTableComponent, OperativeTable } from '../../../../Components/System/Area_Manager/Operatives/operatives-table/operatives-table.component';
import { OperativeDetailsMod } from '../../../../Core/Models/System/OperativeMod';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';
import { BulkImportOperativeManagerService } from '../../../../Core/Service/System/Others/InventoryBase/bulk-import-operative-manager.service';
import { OperativeFilterService } from '../../../../Core/Service/System/Others/Operatives/operative-filter.service';
import { OperativeService } from '../../../../Core/Service/System/operative.service';
import { AlertTotalService } from '../../../../Core/Service/alert-total.service';

@Component({
	selector: 'app-area-manager-operatives',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		MatButtonModule,
		MatIconModule,
		MatChipsModule,
		MatMenuModule,
		MatPaginatorModule,
		LoaderComponent,
		ImportExcelComponent,
		OperativesTableComponent,
		MatDividerModule
	],
	templateUrl: './area-manager-operatives.component.html',
	styleUrls: ['../../../../Components/Shared/Styles/area-manager-import-data-shared.css', './area-manager-operatives.component.css']
})
export class AreaManagerOperativesComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);
	readonly importManager = inject(BulkImportOperativeManagerService);
	readonly filterService = inject(OperativeFilterService);
	private readonly operativeService = inject(OperativeService);
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly router = inject(Router);

	// Signals locales del componente
	readonly showImportModal = signal(false);
	readonly showDetailsModal = signal(false);
	readonly selectedOperative = signal<OperativeDetailsMod | null>(null);
	readonly loadingDetails = signal(false);
	readonly loading = signal(true);
	readonly error = signal(false);
	readonly errorMessage = signal('');
	readonly allOperatives = signal<OperativeDetailsMod[]>([]);

	// Computed para datos derivados del estado actual
	readonly currentUserId = computed(() => Number(this.authService.getIdUser()));
	readonly hasOperativesData = computed(() => this.allOperatives().length > 0);

	// Computed para filtrado, paginación y mapeo de datos
	readonly paginatedOperatives = computed(() =>
		this.filterService.getFilteredAndPaginatedItems(this.allOperatives())
	);
	readonly totalOperatives = computed(() =>
		this.filterService.getFilteredItemsCount(this.allOperatives())
	);
	readonly operativeGroups = computed(() =>
		this.filterService.getAvailableGroups(this.allOperatives())
	);
	readonly mappedTableData = computed(() =>
		this.paginatedOperatives().map(operative => this.mapToTableItem(operative))
	);

	async ngOnInit(): Promise<void> {
		await this.loadOperativesData();
	}

	/**
	 * Carga los datos de operativos
	 */
	async loadOperativesData(): Promise<void> {
		this.loading.set(true);
		this.error.set(false);

		try {
			const userId = this.currentUserId();

			if (!userId) {
				this.handleError('No se pudo obtener la información del usuario');
				return;
			}

			const operatives = await this.operativeService.getAllDetatilsByCreate(userId).toPromise();
			this.allOperatives.set(operatives || []);

		} catch (error: any) {
			this.handleError('Error al cargar los operativos');
			console.error('Error loading operatives:', error);
		} finally {
			this.loading.set(false);
		}
	}

	/**
	 * Mapea OperativeDetailsMod a OperativeTableItem
	 */
	private mapToTableItem(operative: OperativeDetailsMod): OperativeTable {
		return {
			id: operative.id.toString(),
			documentNumber: operative.documentNumber,
			fullName: operative.fullName,
			email: operative.email,
			phone: operative.phone,
			documentType: operative.documentType,
			operativeGroupId: operative.operativeGroupId,
			operativeGroupName: operative.operativeGroupName
		};
	}

	/**
	 * Maneja errores
	 */
	private handleError(message: string): void {
		this.error.set(true);
		this.errorMessage.set(message);
		this.loading.set(false);
	}

	/**
	 * Recarga los operativos
	 */
	async reloadOperatives(): Promise<void> {
		await this.loadOperativesData();
	}

	// Métodos de filtrado
	filterByGroup(groupId: string): void {
		this.filterService.filterByGroup(groupId);
	}

	clearFilters(): void {
		this.filterService.clearFilters();
	}

	onSearchChange(): void {
		this.filterService.onSearchChange();
	}

	getGroupFilterDisplay(groupFilter: string): string {
		switch (groupFilter) {
			case 'with-group': return 'Con Grupo';
			case 'without-group': return 'Sin Grupo';
			case 'all': return 'Todos';
			default: return `Grupo ${groupFilter}`;
		}
	}

	// Paginación
	onPageChange(event: PageEvent): void {
		this.filterService.onPageChange(event);
	}

	getDisplayedRange(): string {
		return this.filterService.getDisplayedRange(this.totalOperatives());
	}

	// Gestión de modales
	openImportModal(): void {
		this.showImportModal.set(true);
	}

	closeImportModal(): void {
		this.showImportModal.set(false);
	}

	// Procesamiento de archivos Excel
	async processExcelImport(file: File): Promise<void> {
		this.closeImportModal();

		const success = await this.importManager.processExcelImport(
			file,
			this.currentUserId()
		);

		// Si fue exitoso, recargar operativos
		if (success) {
			await this.reloadOperatives();
		}
	}

	// Funciones utilitarias
	downloadTemplate(): void {
		this.alertService.toast('Descargando plantilla...', 'info');

		setTimeout(() => {
			const link = document.createElement('a');
			link.href = '/Templates/Plantilla_Operativos.xlsx';
			link.download = 'Plantilla_Operativos.xlsx';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			this.alertService.toast('Plantilla descargada correctamente', 'success');
		}, 1000);
	}

	onDeleteItem(operative: OperativeTable): void {
		const operativeIdAsNumber = parseInt(operative.id, 10);

		this.alertService.confirmDestroyWithLoading(
			async () => {
				const result = await this.operativeService.delete(operativeIdAsNumber, 1).toPromise();
				this.loadOperativesData();
				return result;
			},
			{
				destroyTitle: '¿Eliminar Operativo?',
				destroyText: `Se eliminará permanentemente: ${operative.fullName}`,
				destroyConfirmText: 'Sí, eliminar',
				loadingTitle: 'Eliminando...',
				loadingText: 'Eliminando operativo del sistema',
				successTitle: 'Operativo eliminado',
				successText: 'El Operativo ha sido eliminado correctamente'
			}
		).catch(() => {
			// Error ya manejado por confirmDestroyWithLoading
		});
	}

	/**
	 * Navegar a crear operativo manualmente
	 */
	navigateToCreateOperative(): void {
		this.router.navigate(['/areaManager/operative-create']);
	}
}
