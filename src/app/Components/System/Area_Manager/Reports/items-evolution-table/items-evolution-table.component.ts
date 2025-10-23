import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataTableComponent } from '../data-table/data-table.component';
import { ItemEvolutionReport, StatusType, TableColumn } from '../../../../../Core/Models/System/Others/ZoneReportsMod.model';
import { DateUtils, StatusUtils } from '../../../../../Core/Utils/zone-reports.utils';

@Component({
	selector: 'app-items-evolution-table',
	imports: [
		CommonModule,
		FormsModule,
		MatIconModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatTooltipModule,
		DataTableComponent
	],
	templateUrl: './items-evolution-table.component.html',
	styleUrls: ['../../../../Shared/Styles/zone-reports-shared.css', './items-evolution-table.component.css']
})
export class ItemsEvolutionTableComponent {

	// Inputs requeridos del componente
	readonly items = input.required<ItemEvolutionReport[]>();
	readonly selectedStatuses = input<string[]>([]);

	// Outputs de eventos emitidos al componente padre
	readonly statusFilterChanged = output<string[]>();
	readonly viewHistory = output<ItemEvolutionReport>();
	readonly itemSelected = output<ItemEvolutionReport>();

	// Opciones disponibles
	readonly availableStatuses: StatusType[] = [
		'En orden',
		'Reparación',
		'Dañado',
		'Perdido'
	];

	// Configuración de columnas
	readonly columns: TableColumn[] = [
		{ key: 'code', label: 'Código' },
		{ key: 'name', label: 'Nombre' },
		{ key: 'baseStatus', label: 'Estado Base' },
		{ key: 'currentStatus', label: 'Estado Actual' },
		{ key: 'trend', label: 'Tendencia' },
		{ key: 'changes', label: 'Cambios' },
		{ key: 'lastChange', label: 'Último Cambio' }
	];

	// Métodos de eventos
	onStatusFilterChange(selectedStatuses: string[]): void {
		this.statusFilterChanged.emit(selectedStatuses);
	}

	onViewHistory(item: ItemEvolutionReport, event: Event): void {
		event.stopPropagation(); // Evitar que se ejecute el click de la fila
		this.viewHistory.emit(item);
	}

	onItemClick(item: ItemEvolutionReport): void {
		this.itemSelected.emit(item);
	}

	// Métodos de utilidad
	formatDate(dateString: string): string {
		return DateUtils.formatDate(dateString);
	}

	getStatusClass(status: string): string {
		return StatusUtils.getStatusClass(status);
	}

	getTrendIcon(trend: string): string {
		return StatusUtils.getTrendIcon(trend as any);
	}

	getTrendLabel(trend: string): string {
		return StatusUtils.getTrendLabel(trend as any);
	}
}
