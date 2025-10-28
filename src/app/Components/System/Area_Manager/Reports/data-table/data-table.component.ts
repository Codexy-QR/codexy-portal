import { CommonModule } from '@angular/common';
import { Component, computed, ContentChild, effect, inject, input, OnInit, output, TemplateRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableColumn } from '../../../../../Core/Models/System/Others/ZoneReportsMod.model';
import { PaginationService } from '../../../../../Core/Service/System/Others/Reports/pagination.service';
import { PaginationComponent } from "../pagination/pagination.component";

@Component({
	selector: 'app-data-table',
	imports: [
		CommonModule,
		MatTableModule,
		MatIconModule,
		MatButtonModule,
		MatTooltipModule,
		PaginationComponent
	],
	templateUrl: './data-table.component.html',
	styleUrls: ['../../../../Shared/Styles/zone-reports-shared.css', './data-table.component.css']
})
export class DataTableComponent<T = any> implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly paginationService = inject(PaginationService);

	// Inputs requeridos del componente
	readonly title = input.required<string>();
	readonly icon = input.required<string>();
	readonly columns = input.required<TableColumn[]>();
	readonly dataSource = input.required<T[]>();

	// Inputs opcionales del componente
	readonly emptyMessage = input<string>('No hay datos disponibles');
	readonly emptyIcon = input<string>('search_off');
	readonly showRetryButton = input<boolean>(false);
	readonly rowClickable = input<boolean>(false);
	readonly itemsPerPageOptions = input<number[]>([5, 10, 20, 50]);
	readonly defaultPageSize = input<number>(10);

	// Outputs de eventos emitidos al componente padre
	readonly rowClicked = output<T>();
	readonly retry = output<void>();


	// Content projection para templates personalizados
	@ContentChild('headerActions') headerActionsTemplate?: TemplateRef<any>;
	@ContentChild('cellContent') cellTemplate!: TemplateRef<any>;

	// ID único para esta tabla (para la paginación)
	private readonly tableId = `table-${Math.random().toString(36).substr(2, 9)}`;


	// Computed property para datos paginados - ESTO ES LO QUE FALTABA
	readonly paginatedData = computed(() => {
		const result = this.paginationService.paginateData(
			this.tableId,
			this.dataSource(),
		);
		return result;
	});

	// Métodos del ciclo de vida del componente
	ngOnInit(): void {
		// Inicializar paginación
		this.paginationService.initializePagination(
			this.tableId,
			this.dataSource().length,
			this.defaultPageSize()
		);
	}

	readonly updatePagination = effect(() => {
		const currentData = this.dataSource();
		this.paginationService.initializePagination(
			this.tableId,
			currentData.length,
			this.paginationService.getPaginationConfig(this.tableId)?.itemsPerPage || this.defaultPageSize()
		);
	});

	// Computed property para las columnas mostradas
	get displayedColumns(): string[] {
		return this.columns().map(col => col.key);
	}

	// Event handlers
	onRowClick(row: T): void {
		if (this.rowClickable()) {
			this.rowClicked.emit(row);
		}
	}

	onPageChanged(page: number): void {
		this.paginationService.goToPage(this.tableId, page);
	}

	onPageSizeChanged(pageSize: number): void {
		this.paginationService.changeItemsPerPage(this.tableId, pageSize);
	}

	trackByColumn(index: number, column: TableColumn): string {
		return column.key;
	}
}
