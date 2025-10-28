// ===== SERVICIOS DE ENTIDADES =====
// Conjunto de servicios que heredan de GenericService<TWrite, TRead> para estandarizar
// las operaciones CRUD (GetAll, GetById, Create, Update, Delete).
// Cada servicio se especializa en una entidad del sistema, centralizando
// la comunicación con su respectiva API.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GenericService } from '../generic.service';
import { InventoryHistoryMod, InventoryMod, InventoryOptionsMod } from '../../Models/System/InventoryMod.model';
import { InventorySummaryResponse } from '../../Models/System/Others/AreaManagerInventories/inventoryList.model';
import { InventoryDetailResponse } from '../../Models/System/Others/AreaManagerInventories/inventoryDetail.model';

// Servicio de gestión de Inventarios.
// Además del CRUD estándar, permite:
// - Consultar historial de inventarios por grupo operativo.
// - Resumen de inventarios de una zona.
// - Detalle completo de inventario con operativos e ítems.
@Injectable({
	providedIn: 'root'
})
export class InventoryService extends GenericService<InventoryOptionsMod, InventoryMod> {

	constructor(http: HttpClient) {
		const urlBase = environment.apiURL + 'api/Inventary/';
		super(http, urlBase);
	}


	getInventoryHistory(groupId: number): Observable<InventoryHistoryMod[]> {
		return this.http.get<InventoryHistoryMod[]>(`${this.baseUrl}GetInventoryHistory/${groupId}`);
	}

	getInventorySummary(zoneId: number): Observable<InventorySummaryResponse> {
		return this.http.get<InventorySummaryResponse>(`${this.baseUrl}GetInventorySummary/${zoneId}`);
	}

	getInventoryDetail(inventoryId: number): Observable<InventoryDetailResponse> {
		return this.http.get<InventoryDetailResponse>(
			`${this.baseUrl}GetInventoryDetail/${inventoryId}`
		);
	}
}
