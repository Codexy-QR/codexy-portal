import { CommonModule } from '@angular/common';
import { Component, input, model, output, signal } from '@angular/core';
import { ReportFiltersComponent } from '../report-filters/report-filters.component';
import { ZoneInfo, ZoneReportFilters } from '../../../../../Core/Models/System/Others/ZoneReportsMod.model';

@Component({
	selector: 'app-zone-report-header',
	imports: [CommonModule, ReportFiltersComponent],
	templateUrl: './zone-report-header.component.html',
	styleUrls: ['../../../../Shared/Styles/zone-reports-shared.css', './zone-report-header.component.css']
})
export class ZoneReportHeaderComponent {

	// Inputs principales del componente
	readonly zoneInfo = input<ZoneInfo | null>(null);
	readonly loading = input<boolean>(false);
	readonly initialFilters = input<ZoneReportFilters>({
		startDate: null,
		endDate: null,
		selectedStatus: []
	});

	// Outputs de eventos emitidos al componente padre
	readonly filtersApplied = output<ZoneReportFilters>();
	readonly exportExcel = output<void>();
	readonly exportPDF = output<void>();

	// Signal para manejar el estado actual de los filtros
	currentFilters = signal<ZoneReportFilters>({
		startDate: null,
		endDate: null,
		selectedStatus: []
	});


	ngOnInit() {
		// Inicializar filtros con los valores iniciales
		this.currentFilters.set(this.initialFilters());
	}

	// Métodos de eventos
	onFiltersApplied(filters: ZoneReportFilters): void {
		this.currentFilters.set(filters);
		this.filtersApplied.emit(filters);
	}

	onExportExcel(): void {
		this.exportExcel.emit();
	}

	onExportPDF(): void {
		this.exportPDF.emit();
	}
}
