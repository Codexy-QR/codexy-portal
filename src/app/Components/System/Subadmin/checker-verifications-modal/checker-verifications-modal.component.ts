import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VerificationsByCheckerMod } from '../../../../Core/Models/System/Verification.model';
import { CheckersInBranchMod } from './../../../../Core/Models/System/CheckerMod.model';
import { VerificationService } from '../../../../Core/Service/System/verification.service';

@Component({
	selector: 'app-checker-verifications-modal',
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatTooltipModule
	],
	templateUrl: './checker-verifications-modal.component.html',
	styleUrls: ['../../../Shared/Styles/modal-shared.css', './checker-verifications-modal.component.css']
})
export class CheckerVerificationsModalComponent implements OnChanges {
	// Inyección de servicios propios del proyecto
	private readonly verificationService = inject(VerificationService);

	// Inputs principales del componente
	@Input() isOpen = false;
	@Input() checker: CheckersInBranchMod | null = null;
	@Output() onClose = new EventEmitter<void>();

	// Signals para estado y datos
	readonly loading = signal(false);
	readonly error = signal(false);
	private readonly _verifications = signal<VerificationsByCheckerMod[]>([]);
	readonly verifications = computed(() => this._verifications());

	// Computed properties para estadísticas (se mantienen igual)
	readonly totalVerifications = computed(() => this.verifications().length);
	readonly approvedCount = computed(() =>
		this.verifications().filter(v => v.result).length
	);
	readonly rejectedCount = computed(() =>
		this.verifications().filter(v => !v.result).length
	);

	// Métodos del ciclo de vida del componente
	// Cargar verificaciones cuando cambia el checker
	ngOnChanges(changes: SimpleChanges): void {
		if (changes['checker'] && this.checker && this.isOpen) {
			this.loadVerifications();
		}
	}

	private loadVerifications(): void {
		if (!this.checker) return;

		this.loading.set(true);
		this.error.set(false);

		this.verificationService.getVerificationsByChecker(this.checker.id).subscribe({
			next: (verifications) => {
				this._verifications.set(verifications);
				this.loading.set(false);
			},
			error: (error) => {
				console.error('Error al cargar verificaciones:', error);
				this.error.set(true);
				this.loading.set(false);
				this._verifications.set([]);
			}
		});
	}

	closeModal(): void {
		this.onClose.emit();
		this._verifications.set([]);
		this.error.set(false);
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
}
