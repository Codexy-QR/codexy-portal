// recent-inventories.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PaginationComponent } from '../../../Area_Manager/Reports/pagination/pagination.component';
import { PaginatedData } from '../../../../../Core/Service/System/Others/Reports/pagination.service';

export interface Inventory {
	fecha: string;
	zona: string;
	grupoOperativo: string;
	estado: 'Aprobado' | 'NoAprobado';
}

@Component({
	selector: 'app-recent-inventories',
	standalone: true,
	imports: [CommonModule, MatIconModule, PaginationComponent],
	templateUrl: './recent-inventories.component.html',
	styleUrl: './recent-inventories.component.css',
})
export class RecentInventoriesComponent {
	// Inputs principales del componente
	@Input() inventories: Inventory[] = [];

	// Propiedades para paginación
	currentPage = 1;
	itemsPerPage = 5;
	itemsPerPageOptions = [3, 5, 10, 15];


	// Computed para información de paginación
	get paginationData(): PaginatedData<Inventory> {
		const totalItems = this.inventories.length;
		const totalPages = Math.ceil(totalItems / this.itemsPerPage);
		const startIndex = (this.currentPage - 1) * this.itemsPerPage;
		const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems);
		const paginatedData = this.inventories.slice(startIndex, endIndex);

		return {
			data: paginatedData,
			pagination: {
				currentPage: this.currentPage,
				itemsPerPage: this.itemsPerPage,
				totalItems,
				totalPages,
				startIndex,
				endIndex,
				hasPreviousPage: this.currentPage > 1,
				hasNextPage: this.currentPage < totalPages,
			}
		};
	}

	// Métodos para manejar eventos de paginación
	onPageChange(page: number): void {
		this.currentPage = page;
	}

	onPageSizeChange(pageSize: number): void {
		this.itemsPerPage = pageSize;
		this.currentPage = 1; // Reset a la primera página
	}

	getStatusIcon(estado: string): string {
		return estado === 'Aprobado' ? 'check_circle' : 'error';
	}

	getStatusClass(estado: string): string {
		return estado === 'Aprobado' ? 'approved' : 'not-approved';
	}
}
