import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

export interface OperativeTable {
	id: string;
	documentNumber: string;
	fullName: string;
	email: string;
	phone: string;
	documentType: string;
	operativeGroupId?: number | null;
	operativeGroupName?: string;
}

@Component({
	selector: 'app-operatives-table',
	standalone: true,
	imports: [
		CommonModule,
		MatTableModule,
		MatIconModule,
		MatButtonModule
	],
	templateUrl: './operatives-table.component.html',
	styleUrls: ['./operatives-table.component.css']
})
export class OperativesTableComponent {

	// Inputs principales del componente
	@Input() dataSource: OperativeTable[] = [];

	// Outputs de eventos emitidos al componente padre
	@Output() deleteItem = new EventEmitter<OperativeTable>();

	readonly displayedColumns: string[] = [
		'documentNumber',
		'fullName',
		'email',
		'phone',
		'documentType',
		'operativeGroup',
		'actions'
	];

	onDeleteItem(item: OperativeTable): void {
		this.deleteItem.emit(item);
	}

	getGroupBadgeClass(groupId?: number): string {
		return groupId ? 'has-group' : 'no-group';
	}

	getGroupDisplay(groupId?: number, groupName?: string): string {
		if (!groupId) return 'Sin grupo';
		return groupName || `Grupo ${groupId}`;
	}
}
