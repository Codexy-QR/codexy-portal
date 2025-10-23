import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DashboardBranchModel, DashboardModel, ZoneDashboard } from '../../../Models/System/Others/Dashboard.model';
import { GenericService } from '../../generic.service';

// ===== SERVICIO DE DASHBOARD =====
// Gestiona la obtención de métricas globales y estadísticas operativas desde el backend.
// Este servicio es clave en la capa de visualización, permitiendo construir dashboards
// administrativos dinámicos a diferentes niveles:
//
// - getDashboardCompany: Devuelve métricas globales a nivel empresa, con filtros opcionales por sucursal o zona.
// - getDashboardBranch: Proporciona estadísticas detalladas de una sucursal concreta (zonas, inventarios, ítems, etc.).
// - getDashboardZone: Ofrece datos de estado e histórico de inventarios para una zona específica.
@Injectable({
	providedIn: 'root'
})
export class DashboardService extends GenericService<any, any> {

	constructor(http: HttpClient) {
		const urlBase = environment.apiURL + 'api/Dashboard/';
		super(http, urlBase);
	}

	getDashboardCompany(companyId: number, branchId?: number, zoneId?: number): Observable<DashboardModel> {
		let params = new HttpParams().set('companyId', companyId);

		if (branchId !== undefined && branchId !== null) {
			params = params.set('branchId', branchId);
		}
		if (zoneId !== undefined && zoneId !== null) {
			params = params.set('zoneId', zoneId);
		}

		return this.http.get<DashboardModel>(this.baseUrl, { params });
	}

	getDashboardBranch(branchId: number): Observable<DashboardBranchModel> {
		return this.http.get<DashboardBranchModel>(this.baseUrl + `branch/${branchId}`);
	}

	getDashboardZone(zoneId: number): Observable<ZoneDashboard> {
		return this.http.get<ZoneDashboard>(this.baseUrl + `zone/${zoneId}`);
	}
}
