import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { OperativeDetailsMod } from '../../../../Models/System/OperativeMod';

// ===== SERVICIO DE FILTRADO Y PAGINACIÓN DE OPERATIVOS =====
// Este servicio gestiona toda la lógica relacionada con el filtrado,
// búsqueda y paginación de los operativos desde el frontend.
//
// Principales responsabilidades:
// ✅ Aplicar filtros de búsqueda por nombre, documento, email o teléfono.
// ✅ Filtrar por estado de asignación a grupos o por grupo específico.
// ✅ Paginar resultados filtrados de manera eficiente.
// ✅ Mantener el estado reactivo de filtros y paginación usando Signals.
@Injectable({
	providedIn: 'root'
})
export class OperativeFilterService {

	// Signals para filtros y paginación
	readonly searchText = signal('');
	readonly groupFilter = signal('all');
	readonly pageIndex = signal(0);
	readonly pageSize = signal(10);

	/**
	 * Aplica filtros y paginación a los operativos
	 */
	getFilteredAndPaginatedItems(allOperatives: OperativeDetailsMod[]): OperativeDetailsMod[] {
		const startIndex = this.pageIndex() * this.pageSize();
		const endIndex = startIndex + this.pageSize();

		const filteredData = this.applyFilters(allOperatives);
		return filteredData.slice(startIndex, endIndex);
	}

	/**
	 * Obtiene el total de operativos filtrados
	 */
	getFilteredItemsCount(allOperatives: OperativeDetailsMod[]): number {
		return this.applyFilters(allOperatives).length;
	}

	/**
	 * Aplica todos los filtros
	 */
	private applyFilters(operatives: OperativeDetailsMod[]): OperativeDetailsMod[] {
		return operatives.filter(operative =>
			this.matchesSearch(operative) && this.matchesGroupFilter(operative)
		);
	}

	/**
	 * Filtra por búsqueda de texto
	 */
	private matchesSearch(operative: OperativeDetailsMod): boolean {
		const search = this.searchText().toLowerCase();
		if (!search) return true;

		return (
			operative.fullName.toLowerCase().includes(search) ||
			operative.documentNumber.toLowerCase().includes(search) ||
			operative.email.toLowerCase().includes(search) ||
			operative.phone.toLowerCase().includes(search)
		);
	}

	/**
	 * Filtra por grupo
	 */
	private matchesGroupFilter(operative: OperativeDetailsMod): boolean {
		if (this.groupFilter() === 'all') return true;
		if (this.groupFilter() === 'with-group') return !!operative.operativeGroupId;
		if (this.groupFilter() === 'without-group') return !operative.operativeGroupId;

		// Filtro por ID de grupo específico
		return operative.operativeGroupId?.toString() === this.groupFilter();
	}

	/**
	 * Obtiene los grupos únicos disponibles
	 */
	getAvailableGroups(allOperatives: OperativeDetailsMod[]): string[] {
		const groups = ['all', 'with-group', 'without-group'];

		// Agregar IDs de grupos específicos
		const specificGroups = [...new Set(
			allOperatives
				.filter(op => op.operativeGroupId)
				.map(op => op.operativeGroupId!.toString())
		)];

		return [...groups, ...specificGroups];
	}

	/**
	 * Filtrar por grupo
	 */
	filterByGroup(groupId: string): void {
		this.groupFilter.set(groupId);
		this.resetPagination();
	}

	/**
	 * Limpiar todos los filtros
	 */
	clearFilters(): void {
		this.searchText.set('');
		this.groupFilter.set('all');
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
		return this.searchText() !== '' || this.groupFilter() !== 'all';
	}

	/**
	 * Resetear el servicio a estado inicial
	 */
	reset(): void {
		this.searchText.set('');
		this.groupFilter.set('all');
		this.pageIndex.set(0);
		this.pageSize.set(10);
	}
}
