import { Component, Input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { LoaderComponent } from '../../app-loader/app-loader.component';
import { StaffFilterPipe } from '../../../../Core/Pipes/staff-filter.pipe';
import { PaginationComponent, PaginationData } from '../../pagination/pagination.component';


export interface TableColumn {
	key: string;
	label: string;
	type?: 'text' | 'icon' | 'action' | 'custom';
	icon?: string;
	formatter?: (value: any, row: any) => string;
}

export interface TableConfig {
	title: string;
	subtitle: string;
	emptyState: {
		icon: string;
		title: string;
		description: string;
		buttonText?: string;
		buttonIcon?: string;
		buttonAction?: () => void;
	};
	columns: TableColumn[];
	modalSections: ModalSection[];
}

export interface ModalSection {
	title: string;
	icon: string;
	fields: ModalField[];
}

export interface ModalField {
	key: string;
	label: string;
	formatter?: (value: any) => string;
}

@Component({
	selector: 'app-show-staff',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		MatButtonModule,
		MatIconModule,
		MatTableModule,
		LoaderComponent,
		StaffFilterPipe,
		PaginationComponent
	],
	templateUrl: './show-staff.component.html',
	styleUrls: ['../../Styles/modal-shared.css', './show-staff.component.css']
})
export class ShowStaffComponent {

	// Inputs principales del componente
	@Input() data: any[] = [];
	@Input() loading = false;
	@Input() error: string | null = null;
	@Input() config!: TableConfig;
	@Input() searchPlaceholder = 'Buscar...';
	@Input() itemsPerPage = 5;
	@Input() itemsPerPageOptions = [5, 10, 25, 50];
	@Input() enablePagination = true;

	// Outputs de eventos emitidos al componente padre
	@Output() rowClick = new EventEmitter<any>();
	@Output() buttonAction = new EventEmitter<void>();
	@Output() pageChange = new EventEmitter<number>();
	@Output() pageSizeChange = new EventEmitter<number>();

	// Signals para controlar el ítem seleccionado y el estado del modal
	selectedItem = signal<any>(null);
	isModalOpen = signal(false);
	currentPage = signal(1);

	// Computed para datos paginados
	paginatedData(filteredData: any[]): any[] {
		if (!this.enablePagination) {
			return filteredData;
		}

		const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
		const endIndex = startIndex + this.itemsPerPage;

		return filteredData.slice(startIndex, endIndex);
	}

	// Computed para la información de paginación
	paginationData(filteredData: any[]): PaginationData {
		const totalItems = filteredData.length;
		const totalPages = Math.ceil(totalItems / this.itemsPerPage);
		const currentPage = this.currentPage();
		const startIndex = (currentPage - 1) * this.itemsPerPage;
		const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems);

		return {
			currentPage,
			itemsPerPage: this.itemsPerPage,
			totalItems,
			totalPages,
			startIndex,
			endIndex,
			hasPreviousPage: currentPage > 1,
			hasNextPage: currentPage < totalPages
		};
	}


	// Variables de estado y control local
	searchText = '';

	get displayedColumns(): string[] {
		return this.config.columns.map(col => col.key).concat('actions');
	}

	get hasData(): boolean {
		return this.data.length > 0;
	}

	onViewDetails(item: any): void {
		this.selectedItem.set(item);
		this.isModalOpen.set(true);
		this.rowClick.emit(item);
	}

	closeModal(): void {
		this.isModalOpen.set(false);
		this.selectedItem.set(null);
	}

	onButtonAction(): void {
		this.buttonAction.emit();
	}

	getCellValue(item: any, column: TableColumn): string {
		const value = item[column.key];
		if (column.formatter) {
			return column.formatter(value, item);
		}
		return value || '';
	}

	// Manejar cambio de página
	onPageChange(page: number): void {
		this.currentPage.set(page);
		this.pageChange.emit(page);
	}

	// Manejar cambio de tamaño de página
	onPageSizeChange(pageSize: number): void {
		this.itemsPerPage = pageSize;
		this.currentPage.set(1); // Reset a la primera página
		this.pageSizeChange.emit(pageSize);
	}

	// Método opcional para resetear a página 1 cuando se busca
	onSearchChange(): void {
		this.currentPage.set(1);
	}
}
