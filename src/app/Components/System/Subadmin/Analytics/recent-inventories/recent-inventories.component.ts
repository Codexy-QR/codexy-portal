// recent-inventories.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface Inventory {
	fecha: string;
	zona: string;
	grupoOperativo: string;
	estado: 'Aprobado' | 'NoAprobado';
}

@Component({
	selector: 'app-recent-inventories',
	standalone: true,
	imports: [CommonModule, MatIconModule],
	templateUrl: './recent-inventories.component.html',
	styleUrl: './recent-inventories.component.css'
})
export class RecentInventoriesComponent {

	// Inputs principales del componente
	@Input() inventories: Inventory[] = [];

	getStatusIcon(estado: string): string {
		return estado === 'Aprobado' ? 'check_circle' : 'error';
	}

	getStatusClass(estado: string): string {
		return estado === 'Aprobado' ? 'approved' : 'not-approved';
	}
}
