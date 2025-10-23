import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ZoneReport } from '../../../../../Core/Models/System/Others/ZoneReportsMod.model';
import { DateUtils, StatusUtils } from '../../../../../Core/Utils/zone-reports.utils';

@Component({
	selector: 'app-zone-summary',
	imports: [CommonModule, MatIconModule, MatCardModule],
	templateUrl: './zone-summary.component.html',
	styleUrls: ['../../../../Shared/Styles/zone-reports-shared.css', './zone-summary.component.css']
})
export class ZoneSummaryComponent {

	// Inputs requeridos del componente
	readonly zoneReport = input.required<ZoneReport>();

	// Métodos de utilidad
	formatDate(dateString: string): string {
		return DateUtils.formatDate(dateString);
	}

	getStatusIcon(status: string): string {
		return StatusUtils.getStatusIcon(status);
	}

	getStatusClass(status: string): string {
		return StatusUtils.getStatusClass(status);
	}

	// Métodos para la verificación basados en datos reales
	getLastVerificationStatus(): string {
		const zoneInfo = this.zoneReport().zoneInfo;

		if (!zoneInfo.lastVerificationDate) {
			return 'unknown';
		}

		if (zoneInfo.lastVerificationResult === true) {
			return 'approved';
		} else if (zoneInfo.lastVerificationResult === false) {
			return 'rejected';
		}

		return 'unknown';
	}

	getLastVerificationIcon(): string {
		const status = this.getLastVerificationStatus();

		switch (status) {
			case 'approved':
				return 'check_circle';
			case 'rejected':
				return 'cancel';
			default:
				return 'help';
		}
	}

	getLastVerificationText(): string {
		const status = this.getLastVerificationStatus();

		switch (status) {
			case 'approved':
				return 'Aprobada';
			case 'rejected':
				return 'Rechazada';
			default:
				return 'Estado desconocido';
		}
	}
}
