// item-history-modal.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ItemEvolutionReport } from '../../../../../Core/Models/System/Others/ZoneReportsMod.model';

@Component({
	selector: 'app-item-history-report',
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatTooltipModule
	],
	templateUrl: './item-history-report.component.html',
	styleUrls: ['../../../../Shared/Styles/modal-shared.css', './item-history-report.component.css']
})
export class ItemHistoryReportComponent {

	// Inputs principales del componente
	@Input() isOpen = false;
	@Input() item: ItemEvolutionReport | null = null;

	// Outputs de eventos emitidos al componente padre
	@Output() onClose = new EventEmitter<void>();
	closeModal(): void {
		this.onClose.emit();
	}

	exportItemHistory(): void {
		console.log('Exportando historial del ítem:', this.item?.code);
		// TODO: Implementar exportación específica del ítem
	}

	// Métodos de formato
	formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	formatDateTime(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Métodos para estados
	getStatusClass(status: string): string {
		const classes: Record<string, string> = {
			'En orden': 'status-ok',
			'Reparación': 'status-repair',
			'Dañado': 'status-damaged',
			'Perdido': 'status-lost'
		};
		return classes[status] || 'status-unknown';
	}

	getStatusIcon(status: string): string {
		const icons: Record<string, string> = {
			'En orden': 'check_circle',
			'Reparación': 'build',
			'Dañado': 'warning',
			'Perdido': 'search_off'
		};
		return icons[status] || 'help';
	}

	getEventStatusClass(event: any): string {
		return event.hasChanged ? 'changed' : 'unchanged';
	}

	getChangeIcon(changeType: string): string {
		const icons: Record<string, string> = {
			'mejoró': 'trending_up',
			'empeoró': 'trending_down',
			'sin cambio': 'remove'
		};
		return icons[changeType] || 'help';
	}

	getTrendIcon(trend: string): string {
		const icons: Record<string, string> = {
			'mejorando': 'trending_up',
			'empeorando': 'trending_down',
			'estable': 'trending_flat'
		};
		return icons[trend] || 'help';
	}

	getTrendLabel(trend: string): string {
		const labels: Record<string, string> = {
			'mejorando': 'Mejorando',
			'empeorando': 'Empeorando',
			'estable': 'Estable'
		};
		return labels[trend] || trend;
	}
}
