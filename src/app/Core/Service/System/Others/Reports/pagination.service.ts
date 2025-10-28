import { Injectable } from '@angular/core';

export interface PaginationConfig {
	currentPage: number;
	itemsPerPage: number;
	totalItems: number;
}

export interface PaginatedData<T> {
	data: T[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
		startIndex: number;
		endIndex: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

// ===== SERVICIO DE PAGINACIÓN REUTILIZABLE =====
// Centraliza toda la lógica de paginación para tablas y listados del sistema.
// Permite controlar la página actual, elementos por página, totales y navegación,
// así como manejar múltiples tablas de forma independiente.
@Injectable({
	providedIn: 'root'
})
export class PaginationService {
	// Configuración por defecto
	private readonly DEFAULT_ITEMS_PER_PAGE = 10;
	private readonly ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50, 100];

	// Almacenar configuraciones por tabla (usando un Map)
	private readonly paginationConfigs = new Map<string, PaginationConfig>();

	// Inicializar paginación para una tabla específica
	initializePagination(tableId: string, totalItems: number, itemsPerPage?: number): void {
		this.paginationConfigs.set(tableId, {
			currentPage: 1,
			itemsPerPage: itemsPerPage || this.DEFAULT_ITEMS_PER_PAGE,
			totalItems: totalItems
		});
	}

	// Obtener configuración de paginación
	getPaginationConfig(tableId: string): PaginationConfig | null {
		return this.paginationConfigs.get(tableId) || null;
	}

	// Paginar datos
	paginateData<T>(
		tableId: string,
		data: T[],
		currentPage?: number,
		itemsPerPage?: number
	): PaginatedData<T> {

		// Obtener o crear configuración
		let config = this.paginationConfigs.get(tableId);

		if (!config) {
			config = {
				currentPage: currentPage || 1,
				itemsPerPage: itemsPerPage || this.DEFAULT_ITEMS_PER_PAGE,
				totalItems: data.length
			};
			this.paginationConfigs.set(tableId, config);
		}

		// Actualizar configuración si se proporcionan nuevos valores
		if (currentPage !== undefined) config.currentPage = currentPage;
		if (itemsPerPage !== undefined) config.itemsPerPage = itemsPerPage;
		config.totalItems = data.length;

		// Calcular paginación
		const totalPages = Math.ceil(config.totalItems / config.itemsPerPage);

		// Validar página actual
		if (config.currentPage < 1) config.currentPage = 1;
		if (config.currentPage > totalPages) config.currentPage = Math.max(1, totalPages);

		// Calcular índices
		const startIndex = (config.currentPage - 1) * config.itemsPerPage;
		const endIndex = Math.min(startIndex + config.itemsPerPage - 1, config.totalItems - 1);

		// Obtener datos de la página actual
		const paginatedData = data.slice(startIndex, startIndex + config.itemsPerPage);

		// Guardar configuración actualizada
		this.paginationConfigs.set(tableId, config);

		return {
			data: paginatedData,
			pagination: {
				currentPage: config.currentPage,
				totalPages: totalPages,
				totalItems: config.totalItems,
				itemsPerPage: config.itemsPerPage,
				startIndex: startIndex,
				endIndex: endIndex,
				hasNextPage: config.currentPage < totalPages,
				hasPreviousPage: config.currentPage > 1
			}
		};
	}

	// Navegar a una página específica
	goToPage(tableId: string, page: number): void {
		const config = this.paginationConfigs.get(tableId);
		if (config) {
			config.currentPage = page;
			this.paginationConfigs.set(tableId, config);
		}
	}

	// Página siguiente
	nextPage(tableId: string): void {
		const config = this.paginationConfigs.get(tableId);
		if (config) {
			const totalPages = Math.ceil(config.totalItems / config.itemsPerPage);
			if (config.currentPage < totalPages) {
				config.currentPage++;
				this.paginationConfigs.set(tableId, config);
			}
		}
	}

	// Página anterior
	previousPage(tableId: string): void {
		const config = this.paginationConfigs.get(tableId);
		if (config) {
			if (config.currentPage > 1) {
				config.currentPage--;
				this.paginationConfigs.set(tableId, config);
			}
		}
	}

	// Cambiar elementos por página
	changeItemsPerPage(tableId: string, itemsPerPage: number): void {
		const config = this.paginationConfigs.get(tableId);
		if (config) {
			config.itemsPerPage = itemsPerPage;
			config.currentPage = 1; // Resetear a la primera página
			this.paginationConfigs.set(tableId, config);
		}
	}

	// Obtener opciones de elementos por página
	getItemsPerPageOptions(): number[] {
		return [...this.ITEMS_PER_PAGE_OPTIONS];
	}

	// Resetear paginación
	resetPagination(tableId: string): void {
		const config = this.paginationConfigs.get(tableId);
		if (config) {
			config.currentPage = 1;
			this.paginationConfigs.set(tableId, config);
		}
	}

	// Limpiar configuración de una tabla
	clearPagination(tableId: string): void {
		this.paginationConfigs.delete(tableId);
	}

	// Limpiar todas las configuraciones
	clearAllPagination(): void {
		this.paginationConfigs.clear();
	}

	// Utilidades para generar números de página para mostrar en el paginador
	getPageNumbers(tableId: string, maxVisiblePages: number = 5): number[] {
		const config = this.paginationConfigs.get(tableId);
		if (!config) return [];

		const totalPages = Math.ceil(config.totalItems / config.itemsPerPage);
		const currentPage = config.currentPage;

		if (totalPages <= maxVisiblePages) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const half = Math.floor(maxVisiblePages / 2);
		let start = Math.max(1, currentPage - half);
		let end = Math.min(totalPages, start + maxVisiblePages - 1);

		if (end === totalPages) {
			start = Math.max(1, totalPages - maxVisiblePages + 1);
		}

		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}
}
