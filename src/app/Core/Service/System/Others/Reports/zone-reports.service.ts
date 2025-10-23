import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import {
	InventoryReport,
	ItemEvolutionReport,
	VerificationReport,
	ZoneReport,
	ZoneReportFilters
} from '../../../../Models/System/Others/ZoneReportsMod.model';

// ===== SERVICIO PRINCIPAL DE REPORTES DE ZONA =====
// Este servicio se comunica directamente con el backend para obtener,
// filtrar y exportar toda la información relacionada con los reportes
// de zonas: inventarios, evolución de ítems, verificaciones y datos consolidados.
//
// Además, ofrece métodos para exportar reportes en Excel y PDF.
@Injectable({
	providedIn: 'root'
})
export class ZoneReportsService {

	// Inyección de servicios propios del proyecto
	private readonly http = inject(HttpClient);

	private readonly baseUrl = environment.apiURL + 'api/ZoneReports/';
	private readonly exportBaseUrl = environment.apiURL + 'api/Export/';

	// Métodos principales que llaman al backend real
	getZoneReport(zoneId: number, filters?: ZoneReportFilters): Observable<ZoneReport> {
		let params = this.buildFiltersParams(filters);
		return this.http.get<ZoneReport>(`${this.baseUrl}zones/${zoneId}/report`, { params });
	}

	getInventoryReports(zoneId: number, filters?: ZoneReportFilters): Observable<InventoryReport[]> {
		let params = this.buildFiltersParams(filters);
		return this.http.get<InventoryReport[]>(`${this.baseUrl}zones/${zoneId}/inventories`, { params });
	}

	getItemsEvolution(zoneId: number, filters?: ZoneReportFilters): Observable<ItemEvolutionReport[]> {
		let params = this.buildFiltersParams(filters);
		return this.http.get<ItemEvolutionReport[]>(`${this.baseUrl}zones/${zoneId}/items-evolution`, { params });
	}

	getVerificationReports(zoneId: number, filters?: ZoneReportFilters): Observable<VerificationReport[]> {
		let params = this.buildFiltersParams(filters);
		return this.http.get<VerificationReport[]>(`${this.baseUrl}zones/${zoneId}/verifications`, { params });
	}

	// Metodos para Exportacion
	exportToExcel(zoneId: number, filters?: ZoneReportFilters): Observable<Blob> {
		let params = this.buildFiltersParams(filters);
		return this.http.get(`${this.exportBaseUrl}zones/${zoneId}/excel`, {
			params,
			responseType: 'blob'
		});
	}

	exportToPdf(zoneId: number, filters?: ZoneReportFilters): Observable<Blob> {
		let params = this.buildFiltersParams(filters);
		return this.http.get(`${this.exportBaseUrl}zones/${zoneId}/pdf`, {
			params,
			responseType: 'blob'
		});
	}

	// Método auxiliar para construir parámetros de filtro
	private buildFiltersParams(filters?: ZoneReportFilters): HttpParams {
		let params = new HttpParams();

		if (filters) {
			if (filters.startDate) {
				params = params.set('startDate', filters.startDate.toISOString());
			}

			if (filters.endDate) {
				params = params.set('endDate', filters.endDate.toISOString());
			}

			if (filters.selectedStatus && filters.selectedStatus.length > 0) {
				filters.selectedStatus.forEach(status => {
					params = params.append('selectedStatus', status);
				});
			}
		}

		return params;
	}
}
