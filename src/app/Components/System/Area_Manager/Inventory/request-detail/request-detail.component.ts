import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InventoryRequestNotificationMod } from '../../../../../Core/Models/ParametersModule/Notification.mod';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
	selector: 'app-request-detail',
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatTooltip
	],
	templateUrl: './request-detail.component.html',
	styleUrls: ['../../../../Shared/Styles/modal-shared.css', './request-detail.component.css']
})
export class RequestDetailComponent {

	// Inputs principales del componente
	@Input() isOpen = false;
	@Input() request: InventoryRequestNotificationMod | null = null;

	// Outputs de eventos emitidos al componente padre
	@Output() onClose = new EventEmitter<void>();

	closeModal(): void {
		this.onClose.emit();
	}

	// Métodos de formato
	formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	// Métodos para análisis de cambios
	getStateChangeClass(baseState: string, newState: string): string {
		const stateHierarchy = ['Perdido', 'Dañado', 'En reparación', 'En orden'];
		const baseIndex = stateHierarchy.indexOf(baseState);
		const newIndex = stateHierarchy.indexOf(newState);

		if (newIndex > baseIndex) return 'state-improved';
		if (newIndex < baseIndex) return 'state-worsened';
		return 'state-same';
	}

	getChangeIcon(baseState: string, newState: string): string {
		const changeClass = this.getStateChangeClass(baseState, newState);
		const icons: Record<string, string> = {
			'state-improved': 'trending_up',
			'state-worsened': 'trending_down',
			'state-same': 'remove'
		};
		return icons[changeClass] || 'help';
	}

	getImprovedCount(): number {
		if (!this.request) return 0;
		return this.request.content.differences.filter(diff =>
			this.getStateChangeClass(diff.baseState, diff.inventaryState) === 'state-improved'
		).length;
	}

	getWorsenedCount(): number {
		if (!this.request) return 0;
		return this.request.content.differences.filter(diff =>
			this.getStateChangeClass(diff.baseState, diff.inventaryState) === 'state-worsened'
		).length;
	}

	getCriticalCount(): number {
		if (!this.request) return 0;
		return this.request.content.differences.filter(diff =>
			diff.inventaryState === 'Dañado' || diff.inventaryState === 'Perdido'
		).length;
	}
}
