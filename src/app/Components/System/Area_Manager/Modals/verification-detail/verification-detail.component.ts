import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VerificationDetailResponse } from '../../../../../Core/Models/System/Others/AreaManagerInventories/verificationDetail.model';

@Component({
	selector: 'app-verification-detail',
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatTooltipModule,
		MatProgressSpinnerModule
	],
	templateUrl: './verification-detail.component.html',
	styleUrls: ['../../../../Shared/Styles/modal-shared.css', './verification-detail.component.css']
})
export class VerificationDetailComponent {

	// Inputs principales del componente
	@Input() isOpen = false;
	@Input() verification: VerificationDetailResponse | null = null;

	// Outputs de eventos emitidos al componente padre
	@Output() onClose = new EventEmitter<void>();

	closeModal(): void {
		this.onClose.emit();
	}

	// ===== MÉTODOS DE FORMATO =====
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

	// ===== MÉTODOS DE ESTADO DE VERIFICACIÓN =====
	getVerificationStatusLabel(): string {
		if (!this.verification) return 'DESCONOCIDO';
		return this.verification.result ? 'APROBADO' : 'RECHAZADO';
	}

	getVerificationStatusIcon(): string {
		if (!this.verification) return 'help';
		return this.verification.result ? 'check_circle' : 'cancel';
	}

	getVerificationStatusClass(): string {
		if (!this.verification) return 'status-unknown';
		return this.verification.result ? 'status-approved' : 'status-rejected';
	}

	// ===== MÉTODOS DE UTILIDAD =====
	hasObservations(): boolean {
		return !!(this.verification?.observations && this.verification.observations.trim());
	}

	hasInventoryObservations(): boolean {
		return !!(this.verification?.inventory.observations && this.verification.inventory.observations.trim());
	}

	// ===== MÉTODOS PARA INFORMACIÓN ADICIONAL =====
	getVerificationSummary(): { icon: string; label: string; value: string }[] {
		if (!this.verification) return [];

		return [
			{
				icon: 'calendar_today',
				label: 'Fecha de Verificación',
				value: this.formatDateTime(this.verification.date)
			},
			{
				icon: 'person',
				label: 'Verificador',
				value: this.verification.checker.user.name
			},
			{
				icon: 'store',
				label: 'Sucursal',
				value: this.verification.checker.branch.name
			},
			{
				icon: 'inventory_2',
				label: 'Ítems Verificados',
				value: `${this.verification.inventory.itemsCount} ítems`
			}
		];
	}

	// ===== MÉTRICAS DE VERIFICACIÓN =====
	getVerificationMetrics(): { icon: string; value: string | number; label: string; status: string }[] {
		if (!this.verification) return [];

		const result = this.verification.result;
		const itemsCount = this.verification.inventory.itemsCount;

		return [
			{
				icon: 'inventory_2',
				value: itemsCount,
				label: 'Total de Ítems',
				status: 'metric-total'
			},
			{
				icon: result ? 'check_circle' : 'cancel',
				value: result ? 'APROBADO' : 'RECHAZADO',
				label: 'Estado Final',
				status: result ? 'metric-approved' : 'metric-rejected'
			},
			{
				icon: 'rate_review',
				value: this.hasObservations() ? 'CON OBSERVACIONES' : 'SIN OBSERVACIONES',
				label: 'Observaciones',
				status: this.hasObservations() ? 'metric-with-notes' : 'metric-no-notes'
			}
		];
	}

	// ===== INFORMACIÓN DEL VERIFICADOR =====
	getCheckerInfo(): { icon: string; label: string; value: string }[] {
		if (!this.verification) return [];

		return [
			{
				icon: 'account_circle',
				label: 'Nombre',
				value: this.verification.checker.user.name
			},
			{
				icon: 'email',
				label: 'Email',
				value: this.verification.checker.user.email
			},
			{
				icon: 'store',
				label: 'Sucursal',
				value: this.verification.checker.branch.name
			}
		];
	}

	// ===== INFORMACIÓN DEL INVENTARIO RELACIONADO =====
	getInventoryInfo(): { icon: string; label: string; value: string }[] {
		if (!this.verification) return [];

		return [
			{
				icon: 'inventory_2',
				label: 'ID del Inventario',
				value: `#${this.verification.inventory.id}`
			},
			{
				icon: 'calendar_today',
				label: 'Fecha del Inventario',
				value: this.formatDateTime(this.verification.inventory.date)
			},
			{
				icon: 'diversity_3',
				label: 'Grupo Operativo',
				value: this.verification.inventory.operatingGroup.name
			},
			{
				icon: 'fact_check',
				label: 'Ítems Inventariados',
				value: `${this.verification.inventory.itemsCount} ítems`
			}
		];
	}

	// ===== ANÁLISIS DE VERIFICACIÓN =====
	getVerificationAnalysis(): string {
		if (!this.verification) return '';

		const result = this.verification.result;
		const hasObservations = this.hasObservations();
		const itemsCount = this.verification.inventory.itemsCount;

		if (result && !hasObservations) {
			return `El inventario fue aprobado completamente. Se verificaron ${itemsCount} ítems sin observaciones.`;
		} else if (result && hasObservations) {
			return `El inventario fue aprobado con observaciones. Se verificaron ${itemsCount} ítems.`;
		} else if (!result && hasObservations) {
			return `El inventario fue rechazado. Se encontraron inconsistencias en la verificación de ${itemsCount} ítems.`;
		} else {
			return `El inventario fue rechazado. No se pudo completar la verificación de ${itemsCount} ítems.`;
		}
	}

	// ===== ESTADO DE APROBACIÓN =====
	isApproved(): boolean {
		return this.verification?.result === true;
	}

	isRejected(): boolean {
		return this.verification?.result === false;
	}

	// ===== TRACKBY FUNCTIONS PARA OPTIMIZACIÓN =====
	trackByIndex(index: number): number {
		return index;
	}
}
