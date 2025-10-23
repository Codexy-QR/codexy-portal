import { Injectable, signal } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { InventoryItemTable } from '../../../../../Components/System/Area_Manager/Inventory/inventory-table/inventory-table.component';
import { InventoryBaseFilterPipe } from '../../../../../Core/Pipes/inventory-base-filter.pipe';

// ===== SERVICIO DE FILTRADO Y PAGINACIÓN DE INVENTARIO =====
// Implementa la lógica de filtrado, búsqueda, categorización y paginación para
// los ítems del inventario base. Facilita la manipulación de datos en la interfaz
// sin requerir nuevas peticiones al backend.
//
// Principales responsabilidades:
// ✅ Filtrar ítems por nombre, categoría o estado.
// ✅ Implementar paginación dinámica.
// ✅ Obtener categorías y estados disponibles.
// ✅ Gestionar el estado global de filtros y resetearlos cuando sea necesario.
@Injectable({
	providedIn: 'root'
})
export class InventoryFilterService {

	// Signals para filtros y paginación de resultados
	readonly searchText = signal('');
	readonly categoryFilter = signal('all');
	readonly statusFilter = signal('all');
	readonly pageIndex = signal(0);
	readonly pageSize = signal(10);

	/**
	 * Aplica filtros y paginación a los items
	 */
	getFilteredAndPaginatedItems(allItems: InventoryItemTable[]): InventoryItemTable[] {
		const startIndex = this.pageIndex() * this.pageSize();
		const endIndex = startIndex + this.pageSize();

		const filteredData = new InventoryBaseFilterPipe().transform(
			allItems,
			this.searchText(),
			this.categoryFilter(),
			this.statusFilter()
		);

		return filteredData.slice(startIndex, endIndex);
	}

	/**
	 * Obtiene el total de items filtrados
	 */
	getFilteredItemsCount(allItems: InventoryItemTable[]): number {
		return new InventoryBaseFilterPipe().transform(
			allItems,
			this.searchText(),
			this.categoryFilter(),
			this.statusFilter()
		).length;
	}

	/**
	 * Obtiene las categorías únicas disponibles
	 */
	getAvailableCategories(allItems: InventoryItemTable[]): string[] {
		return ['all', ...new Set(allItems.map(item => item.category))];
	}

	/**
	 * Obtiene los estados únicos disponibles
	 */
	getAvailableStatuses(allItems: InventoryItemTable[]): string[] {
		return ['all', ...new Set(allItems.map(item => item.state))];
	}

	/**
	 * Filtrar por categoría
	 */
	filterByCategory(category: string): void {
		this.categoryFilter.set(category);
		this.resetPagination();
	}

	/**
	 * Filtrar por estado
	 */
	filterByStatus(status: string): void {
		this.statusFilter.set(status);
		this.resetPagination();
	}

	/**
	 * Limpiar todos los filtros
	 */
	clearFilters(): void {
		this.searchText.set('');
		this.categoryFilter.set('all');
		this.statusFilter.set('all');
		this.resetPagination();
	}

	/**
	 * Manejar cambio en el buscador
	 */
	onSearchChange(): void {
		this.resetPagination();
	}

	/**
	 * Manejar cambio de página
	 */
	onPageChange(event: PageEvent): void {
		this.pageIndex.set(event.pageIndex);
		this.pageSize.set(event.pageSize);
	}

	/**
	 * Obtener rango de elementos mostrados
	 */
	getDisplayedRange(totalItems: number): string {
		if (totalItems === 0) return "0 - 0";

		const start = this.pageIndex() * this.pageSize() + 1;
		const end = Math.min((this.pageIndex() + 1) * this.pageSize(), totalItems);
		return `${start} - ${end}`;
	}

	/**
	 * Resetear paginación a la primera página
	 */
	private resetPagination(): void {
		this.pageIndex.set(0);
	}

	/**
	 * Verificar si hay filtros activos
	 */
	hasActiveFilters(): boolean {
		return this.searchText() !== '' ||
			this.categoryFilter() !== 'all' ||
			this.statusFilter() !== 'all';
	}

	/**
	 * Resetear el servicio a estado inicial
	 */
	reset(): void {
		this.searchText.set('');
		this.categoryFilter.set('all');
		this.statusFilter.set('all');
		this.pageIndex.set(0);
		this.pageSize.set(10);
	}
}
