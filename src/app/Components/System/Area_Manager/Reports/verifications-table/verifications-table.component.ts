import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DataTableComponent } from '../data-table/data-table.component';
import { TableColumn, VerificationReport } from '../../../../../Core/Models/System/Others/ZoneReportsMod.model';
import { DateUtils } from '../../../../../Core/Utils/zone-reports.utils';

@Component({
	selector: 'app-verifications-table',
	imports: [
		CommonModule,
		MatIconModule,
		DataTableComponent
	],
	templateUrl: './verifications-table.component.html',
	styleUrls: ['../../../../Shared/Styles/zone-reports-shared.css', './verifications-table.component.css']
})
export class VerificationsTableComponent {

	// Inputs requeridos del componente
	readonly verifications = input.required<VerificationReport[]>();

	// Configuración de columnas
	readonly columns: TableColumn[] = [
		{ key: 'inventoryDate', label: 'Fecha Inventario' },
		{ key: 'operatingGroup', label: 'Grupo Operativo' },
		{ key: 'checker', label: 'Verificador' },
		{ key: 'result', label: 'Resultado' },
		{ key: 'verificationDate', label: 'Fecha Verificación' },
		{ key: 'observations', label: 'Observaciones' }
	];

	// Métodos de utilidad
	formatDate(dateString: string): string {
		return DateUtils.formatDate(dateString);
	}
}
