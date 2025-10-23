import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { CategoryInventoryBasePipe } from '../../../../../Core/Pipes/category-inventory-base.pipe';

export interface InventoryItemTable {
	id: string;
	code: string;
	name: string;
	description: string;
	category: string;
	state: string;
}

@Component({
	selector: 'app-inventory-table',
	standalone: true,
	imports: [
		CommonModule,
		MatTableModule,
		MatMenuModule,
		MatIconModule,
		MatButtonModule,
		CategoryInventoryBasePipe,
	],
	templateUrl: './inventory-table.component.html',
	styleUrls: ['./inventory-table.component.css']
})
export class InventoryTableComponent {

	// Inputs principales del componente
	@Input() dataSource: InventoryItemTable[] = [];

	// Outputs de eventos emitidos al componente padre
	@Output() editItem = new EventEmitter<InventoryItemTable>();
	@Output() deleteItem = new EventEmitter<InventoryItemTable>();
	@Output() viewDetails = new EventEmitter<InventoryItemTable>();

	readonly displayedColumns: string[] = ['code', 'name', 'description', 'state', 'actions'];

	stateClasses: { [key: string]: string } = {
		'En orden': 'state-ok',
		'Reparación': 'state-repair',
		'Dañado': 'state-damaged',
		'Perdido': 'state-lost'
	};

	onEditItem(item: InventoryItemTable): void {
		this.editItem.emit(item);
	}

	onDeleteItem(item: InventoryItemTable): void {
		this.deleteItem.emit(item);
	}

	onViewDetails(item: InventoryItemTable): void {
		this.viewDetails.emit(item); // Emitir el evento
	}

	getStateClass(state: string): string {
		return this.stateClasses[state] || 'state-default';
	}
}
