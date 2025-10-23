import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal, OnDestroy, effect } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InventoryDetailResponse } from '../../../../../Core/Models/System/Others/AreaManagerInventories/inventoryDetail.model';

interface FilterOptions {
	searchText: string;
	selectedCategory: string;
	selectedStatus: string;
}

@Component({
	selector: 'app-inventory-detail',
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatTooltipModule,
		MatInputModule,
		MatSelectModule,
		MatFormFieldModule,
		MatProgressSpinnerModule,
		FormsModule,
	],
	templateUrl: './inventory-detail.component.html',
	styleUrls: ['../../../../Shared/Styles/modal-shared.css', './inventory-detail.component.css']
})
export class InventoryDetailComponent implements OnDestroy {

	// Inputs principales del componente
	@Input() isOpen = false;
	@Input() inventory: InventoryDetailResponse | null = null;

	// Outputs de eventos emitidos al componente padre
	@Output() onClose = new EventEmitter<void>();

	// Signals para visibilidad de operativos y filtros
	private readonly showOperatives = signal(false);
	private readonly showFilters = signal(false);

	// Signal para almacenar opciones de filtrado
	private readonly filters = signal<FilterOptions>({
		searchText: '',
		selectedCategory: '',
		selectedStatus: ''
	})

	constructor() {
		// Efecto para resetear filtros cuando cambie el inventory
		effect(() => {
			if (this.inventory) {
				this.resetFilters();
			}
		});
	}

	// Métodos del ciclo de vida del componente
	ngOnDestroy(): void {
		this.resetFilters();
		this.showOperatives.set(false);
		this.showFilters.set(false);
	}

	// Computed properties para optimizar cálculos
	readonly filteredItems = computed(() => {
		const inventory = this.inventory;
		if (!inventory) return [];

		const currentFilters = this.filters();
		return inventory.inventaryDetails.filter(detail => {
			// Filtro por texto (código o nombre)
			const matchesText = !currentFilters.searchText ||
				detail.item.code.toLowerCase().includes(currentFilters.searchText.toLowerCase()) ||
				detail.item.name.toLowerCase().includes(currentFilters.searchText.toLowerCase());

			// Filtro por categoría
			const matchesCategory = !currentFilters.selectedCategory ||
				detail.item.categoryItem.name === currentFilters.selectedCategory;

			// Filtro por estado
			const matchesStatus = !currentFilters.selectedStatus ||
				detail.stateItem.name === currentFilters.selectedStatus;

			return matchesText && matchesCategory && matchesStatus;
		});
	});

	readonly availableCategories = computed(() => {
		const inventory = this.inventory;
		if (!inventory) return [];

		const categories = new Set(
			inventory.inventaryDetails.map(detail => detail.item.categoryItem.name)
		);
		return Array.from(categories).sort();
	});

	readonly availableStatuses = computed(() => {
		const inventory = this.inventory;
		if (!inventory) return [];

		const statuses = new Set(
			inventory.inventaryDetails.map(detail => detail.stateItem.name)
		);
		return Array.from(statuses).sort();
	});

	readonly hasActiveFilters = computed(() => {
		const currentFilters = this.filters();
		return !!(currentFilters.searchText || currentFilters.selectedCategory || currentFilters.selectedStatus);
	});

	// StatusSummary ya viene calculado del backend
	readonly statusSummary = computed(() => {
		return this.inventory?.statusSummary || [];
	});

	// Mapeos constantes (readonly para mejor performance)
	private readonly ITEM_STATUS_ICONS: Readonly<Record<string, string>> = {
		'En orden': 'check_circle',
		'Reparación': 'build',
		'Dañado': 'warning',
		'Perdido': 'search_off',
		'En uso': 'engineering'
	} as const;

	private readonly ITEM_STATUS_CLASSES: Readonly<Record<string, string>> = {
		'En orden': 'status-ok',
		'Reparación': 'status-repair',
		'Dañado': 'status-damaged',
		'Perdido': 'status-lost',
		'En uso': 'status-in-use'
	} as const;

	// === MÉTODOS DE ACCIÓN ===
	closeModal(): void {
		this.resetFilters();
		this.showOperatives.set(false);
		this.showFilters.set(false);
		this.onClose.emit();
	}

	// Se elimina viewVerification() ya que no hay navegación cruzada

	// === GESTIÓN DE FILTROS ===
	toggleFilters(): void {
		this.showFilters.update(value => !value);
	}

	clearFilters(): void {
		this.resetFilters();
	}

	private resetFilters(): void {
		this.filters.set({
			searchText: '',
			selectedCategory: '',
			selectedStatus: ''
		});
	}

	// Métodos para actualizar filtros individuales
	updateSearchText(text: string): void {
		this.filters.update(filters => ({
			...filters,
			searchText: text
		}));
	}

	updateSelectedCategory(category: string): void {
		this.filters.update(filters => ({
			...filters,
			selectedCategory: category
		}));
	}

	updateSelectedStatus(status: string): void {
		this.filters.update(filters => ({
			...filters,
			selectedStatus: status
		}));
	}

	// === GETTERS PARA TEMPLATE (mantener compatibilidad) ===
	get isShowOperatives(): boolean {
		return this.showOperatives();
	}

	get isShowFilters(): boolean {
		return this.showFilters();
	}

	get currentFilters(): FilterOptions {
		return this.filters();
	}

	// === MÉTODOS DE UTILIDAD ===
	toggleOperatives(): void {
		this.showOperatives.update(value => !value);
	}

	getOperativesCount(): number {
		return this.inventory?.operatingGroup.operatings?.length || 0;
	}

	getItemStatusIcon(status: string): string {
		return this.ITEM_STATUS_ICONS[status] || 'help';
	}

	getItemStatusClass(status: string): string {
		return this.ITEM_STATUS_CLASSES[status] || 'status-unknown';
	}

	// === MÉTODOS DE FORMATO ===
	formatDateTime(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	// === TRACKBY FUNCTIONS PARA PERFORMANCE ===
	trackByItemId = (index: number, item: any): number => {
		return item.item.id;
	};

	trackByStatusName = (index: number, status: { name: string; count: number }): string => {
		return status.name;
	};

	trackByCategory = (index: number, category: string): string => {
		return category;
	};
}
