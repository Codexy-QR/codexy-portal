import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface PaginationData {
	currentPage: number;
	itemsPerPage: number;
	totalItems: number;
	totalPages: number;
	startIndex: number;
	endIndex: number;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
}

@Component({
	selector: 'app-pagination',
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule
	],
	templateUrl: './pagination.component.html',
	styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
	@Input() paginationData!: PaginationData;
	@Input() itemsPerPageOptions: number[] = [5, 10, 25, 50];
	@Input() maxVisiblePages: number = 5;

	@Output() pageChanged = new EventEmitter<number>();
	@Output() pageSizeChanged = new EventEmitter<number>();

	get visiblePageNumbers(): number[] {
		const { totalPages, currentPage } = this.paginationData;
		const maxVisible = this.maxVisiblePages;

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

	onPageClick(page: number): void {
		if (page !== this.paginationData.currentPage) {
			this.pageChanged.emit(page);
		}
	}

	onFirstPage(): void {
		this.pageChanged.emit(1);
	}

	onLastPage(): void {
		this.pageChanged.emit(this.paginationData.totalPages);
	}

	onPreviousPage(): void {
		const currentPage = this.paginationData.currentPage;
		if (currentPage > 1) {
			this.pageChanged.emit(currentPage - 1);
		}
	}

	onNextPage(): void {
		const { currentPage, totalPages } = this.paginationData;
		if (currentPage < totalPages) {
			this.pageChanged.emit(currentPage + 1);
		}
	}

	onPageSizeChange(newSize: number): void {
		this.pageSizeChanged.emit(newSize);
	}
}
