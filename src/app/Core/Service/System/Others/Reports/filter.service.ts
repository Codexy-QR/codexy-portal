import { Injectable, computed, signal } from '@angular/core';
import { InventoryReport, ItemEvolutionReport, VerificationReport, ZoneReportFilters } from '../../../../Models/System/Others/ZoneReportsMod.model';

// ===== SERVICIO DE FILTRADO DE REPORTES =====
// Este servicio gestiona la lógica de filtrado de datos en reportes,
// aplicando criterios por fechas, estados o combinaciones de ambos.
// Facilita el trabajo con inventarios, evolución de ítems y verificaciones
// sin necesidad de realizar múltiples llamadas al backend.
@Injectable({
	providedIn: 'root'
})
export class FilterService {

	// Signal para almacenar los filtros activos
	private readonly _activeFilters = signal<ZoneReportFilters>({
		startDate: null,
		endDate: null,
		selectedStatus: []
	});

	// Computed para exponer los filtros activos
	readonly activeFilters = computed(() => this._activeFilters());

	// Método para actualizar filtros
	updateFilters(filters: ZoneReportFilters): void {
		this._activeFilters.set({ ...filters });
	}

	// Método para limpiar filtros
	clearFilters(): void {
		this._activeFilters.set({
			startDate: null,
			endDate: null,
			selectedStatus: []
		});
	}

	// Filtrado de inventarios por fecha
	filterInventories(inventories: InventoryReport[], filters?: ZoneReportFilters): InventoryReport[] {
		const activeFilters = filters || this._activeFilters();

		if (!activeFilters.startDate && !activeFilters.endDate) {
			return inventories;
		}

		return inventories.filter(inventory => {
			const inventoryDate = new Date(inventory.date);

			// Filtro por fecha de inicio
			if (activeFilters.startDate) {
				const startDate = new Date(activeFilters.startDate);
				startDate.setHours(0, 0, 0, 0);
				if (inventoryDate < startDate) {
					return false;
				}
			}

			// Filtro por fecha de fin
			if (activeFilters.endDate) {
				const endDate = new Date(activeFilters.endDate);
				endDate.setHours(23, 59, 59, 999);
				if (inventoryDate > endDate) {
					return false;
				}
			}

			return true;
		});
	}

	// Filtrado de ítems por estado
	filterItems(items: ItemEvolutionReport[], filters?: ZoneReportFilters): ItemEvolutionReport[] {
		const activeFilters = filters || this._activeFilters();

		if (!activeFilters.selectedStatus || activeFilters.selectedStatus.length === 0) {
			return items;
		}

		return items.filter(item =>
			activeFilters.selectedStatus.includes(item.currentStatus)
		);
	}

	// Filtrado de verificaciones por fecha
	filterVerifications(verifications: VerificationReport[], filters?: ZoneReportFilters): VerificationReport[] {
		const activeFilters = filters || this._activeFilters();

		if (!activeFilters.startDate && !activeFilters.endDate) {
			return verifications;
		}

		return verifications.filter(verification => {
			const verificationDate = new Date(verification.verificationDate);

			// Filtro por fecha de inicio
			if (activeFilters.startDate) {
				const startDate = new Date(activeFilters.startDate);
				startDate.setHours(0, 0, 0, 0);
				if (verificationDate < startDate) {
					return false;
				}
			}

			// Filtro por fecha de fin
			if (activeFilters.endDate) {
				const endDate = new Date(activeFilters.endDate);
				endDate.setHours(23, 59, 59, 999);
				if (verificationDate > endDate) {
					return false;
				}
			}

			return true;
		});
	}

	// Método combinado para filtrar todos los datos
	applyFilters(data: {
		inventories: InventoryReport[];
		items: ItemEvolutionReport[];
		verifications: VerificationReport[];
	}, filters?: ZoneReportFilters): {
		inventories: InventoryReport[];
		items: ItemEvolutionReport[];
		verifications: VerificationReport[];
	} {
		const activeFilters = filters || this._activeFilters();

		return {
			inventories: this.filterInventories(data.inventories, activeFilters),
			items: this.filterItems(data.items, activeFilters),
			verifications: this.filterVerifications(data.verifications, activeFilters)
		};
	}

	// Validación de filtros
	validateFilters(filters: ZoneReportFilters): string[] {
		const errors: string[] = [];

		if (filters.startDate && filters.endDate) {
			if (filters.startDate > filters.endDate) {
				errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
			}
		}

		return errors;
	}

	// Método para resetear a un estado específico
	resetToDefaults(): void {
		this.clearFilters();
	}
}
