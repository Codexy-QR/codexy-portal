import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { PaginatedData } from '../../../../../Core/Service/System/Others/Reports/pagination.service';

@Component({
	selector: 'app-pagination',
	imports: [
		CommonModule,
		FormsModule,
		MatButtonModule,
		MatIconModule,
		MatSelectModule,
		MatFormFieldModule
	],
	templateUrl: './pagination.component.html',
	styleUrl: './pagination.component.css'
})
export class PaginationComponent {

	// Inputs requeridos del componente
	readonly paginationData = input.required<PaginatedData<any>>();

	// Inputs opcionales del componente
	readonly itemsPerPageOptions = input<number[]>([5, 10, 20, 50, 100]);
	readonly maxVisiblePages = input<number>(5);

	// Outputs de eventos emitidos al componente padre
	readonly pageChanged = output<number>();
	readonly pageSizeChanged = output<number>();


	// Computed para números de página visibles
	visiblePageNumbers(): number[] {
		const pagination = this.paginationData().pagination;
		const maxVisible = this.maxVisiblePages();
		const totalPages = pagination.totalPages;
		const currentPage = pagination.currentPage;

		if (totalPages <= maxVisible) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const half = Math.floor(maxVisible / 2);
		let start = Math.max(1, currentPage - half);
		let end = Math.min(totalPages, start + maxVisible - 1);

		if (end === totalPages) {
			start = Math.max(1, totalPages - maxVisible + 1);
		}

		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	// Event handlers
	onPageClick(page: number): void {
		if (page !== this.paginationData().pagination.currentPage) {
			this.pageChanged.emit(page);
		}
	}

	onFirstPage(): void {
		this.pageChanged.emit(1);
	}

	onLastPage(): void {
		this.pageChanged.emit(this.paginationData().pagination.totalPages);
	}

	onPreviousPage(): void {
		const currentPage = this.paginationData().pagination.currentPage;
		if (currentPage > 1) {
			this.pageChanged.emit(currentPage - 1);
		}
	}

	onNextPage(): void {
		const pagination = this.paginationData().pagination;
		if (pagination.currentPage < pagination.totalPages) {
			this.pageChanged.emit(pagination.currentPage + 1);
		}
	}

	onPageSizeChange(newSize: number): void {
		this.pageSizeChanged.emit(newSize);
	}
}
