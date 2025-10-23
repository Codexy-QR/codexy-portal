import { CommonModule } from '@angular/common';
import { Component, inject, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StatusType, ZoneReportFilters } from '../../../../../Core/Models/System/Others/ZoneReportsMod.model';
import { ValidationUtils } from '../../../../../Core/Utils/zone-reports.utils';
import { AlertTotalService } from '../../../../../Core/Service/alert-total.service';

@Component({
	selector: 'app-report-filters',
	imports: [
		CommonModule,
		FormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatButtonModule,
		MatIconModule
	],
	templateUrl: './report-filters.component.html',
	styleUrls: ['../../../../Shared/Styles/zone-reports-shared.css', './report-filters.component.css']
})
export class ReportFiltersComponent {

	// Inyección de servicios propios del proyecto
	private readonly alertService = inject(AlertTotalService)

	// Inputs
	readonly showStatusFilter = input<boolean>(false);
	readonly loading = input<boolean>(false);

	// Two-way binding para los filtros
	readonly filters = model.required<ZoneReportFilters>();

	// Outputs
	readonly filtersApplied = output<ZoneReportFilters>();
	readonly exportExcel = output<void>();
	readonly exportPDF = output<void>();

	// Estados locales
	validationErrors: string[] = [];


	// Opciones disponibles para el filtro de estado
	readonly availableStatuses: StatusType[] = [
		'En orden',
		'Reparación',
		'Dañado',
		'Perdido'
	];

	// Métodos
	onFiltersChange(): void {
		this.validateFilters();

		if (this.validationErrors.length > 0) {
			this.alertService.warning(
				'Atención',
				this.validationErrors.join('\n')
			);
		}
	}

	applyFilters(): void {
		this.validateFilters();
		if (this.isValidFilters()) {
			this.filtersApplied.emit(this.filters());
		} else {
			// Si hay errores, mostramos la alerta con SweetAlert
			this.alertService.error(
				'Filtros inválidos',
				this.validationErrors.join('\n') // concatenamos errores
			);
		}
	}

	clearFilters(): void {
		const clearedFilters: ZoneReportFilters = {
			startDate: null,
			endDate: null,
			selectedStatus: []
		};

		this.filters.set(clearedFilters);
		this.validationErrors = [];
		this.filtersApplied.emit(clearedFilters);
	}

	private validateFilters(): void {
		this.validationErrors = ValidationUtils.validateFilters(this.filters());
	}

	isValidFilters(): boolean {
		this.validateFilters();
		return this.validationErrors.length === 0;
	}
}
