import { Component, EventEmitter, inject, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';
import { isAdminRole } from '../../../../Core/Utils/auth.utils';


@Component({
	selector: 'app-base-table',
	standalone: true,
	imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, MatTooltipModule],
	templateUrl: './base-table.component.html',
	styleUrl: './base-table.component.css'
})
export class BaseTableComponent {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);

	// Inputs principales del componente
	@Input() data: any[] = [];
	@Input() columns: string[] = [];
	@Input() tooltipColumns: string[] = [];
	@Input() statusLabels: { [key in 'true' | 'false']: string } = {
		true: 'Active',
		false: 'Inactive'
	};

	// Outputs de eventos emitidos al componente padre
	@Output() onDelete = new EventEmitter<any>();
	@Output() onEdit = new EventEmitter<any>();

	dataSource = new MatTableDataSource<any>();
	columnasMostrar: string[] = [];

	ngOnChanges(): void {
		this.dataSource.data = this.data || [];

		const role = this.authService.getRole();
		const isAdmin = isAdminRole(role);

		// Solo agregar "active" si el rol es Administrador
		const filteredColumns = isAdmin
			? this.columns
			: this.columns.filter(col => col !== 'active');

		this.columnasMostrar = [...filteredColumns, 'actions'];
	}

	getValue(item: any, path: string): any {
		const value = path.split('.').reduce((acc, key) => acc?.[key], item);
		if (path === 'active') {
			return this.statusLabels[String(value) as 'true' | 'false'];
		}
		return value;
	}

	getStatusClass(column: string, element: any): string {
		if (column !== 'active') return '';
		return element.active ? 'status-active' : 'status-inactive';
	}

	deleteItem(element: any) {
		this.onDelete.emit(element);
	}

	editItem(element: any) {
		this.onEdit.emit(element);
	}

	// Determina si debe mostrarse un tooltip para una celda específica
	shouldShowTooltip(column: string, element: any): boolean {
		const value = this.getValue(element, column);
		return this.tooltipColumns.includes(column) && typeof value === 'string' && value.length > 12;
	}

	/**
	 * Esta función trunca el texto si cumple la misma condición:
	 * Muestra solo los primeros 12 caracteres seguidos de ... si:
	 * la columna está en tooltipColumns.
	 * El valor es un string largo (> 15).
	 */
	truncate(value: any, column: string): string {
		if (this.tooltipColumns.includes(column) && typeof value === 'string' && value.length > 12) {
			return value.slice(0, 10) + '...';
		}
		return value;
	}
}
