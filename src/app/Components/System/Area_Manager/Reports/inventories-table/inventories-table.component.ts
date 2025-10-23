import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DataTableComponent } from '../data-table/data-table.component';
import { InventoryReport, TableColumn } from '../../../../../Core/Models/System/Others/ZoneReportsMod.model';
import { DateUtils } from '../../../../../Core/Utils/zone-reports.utils';

@Component({
	selector: 'app-inventories-table',
	imports: [
		CommonModule,
		MatIconModule,
		DataTableComponent
	],
	templateUrl: './inventories-table.component.html',
	styleUrls: ['../../../../Shared/Styles/zone-reports-shared.css', './inventories-table.component.css']
})
export class InventoriesTableComponent {

	// Inputs requeridos del componente
	readonly inventories = input.required<InventoryReport[]>();

	// Configuración de columnas
	readonly columns: TableColumn[] = [
		{ key: 'date', label: 'Fecha' },
		{ key: 'operatingGroup', label: 'Grupo Operativo' },
		{ key: 'itemsCount', label: 'Ítems' },
		{ key: 'verification', label: 'Verificación' },
		{ key: 'observations', label: 'Observaciones' }
	];

	// Métodos de utilidad
	formatDate(dateString: string): string {
		return DateUtils.formatDate(dateString);
	}
}
