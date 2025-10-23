// ===== SERVICIOS DE ENTIDADES =====
// Conjunto de servicios que heredan de GenericService<TWrite, TRead> para estandarizar
// las operaciones CRUD (GetAll, GetById, Create, Update, Delete).
// Cada servicio se especializa en una entidad del sistema, centralizando
// la comunicación con su respectiva API.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OperativeAssignmentMod, OperativeAvailableMod, OperativeDetailsMod, OperativeMod, OperativeOptionsMod, OperativePartialGpOperativeMod } from '../../Models/System/OperativeMod';
import { ApiResponse, OperativeCreateRequestMod } from '../../Models/System/Others/NestedCreation/OperativeNestedCreation.model';
import { GenericService } from '../generic.service';

// Servicio de gestión de Operativos.
// Además de CRUD, soporta flujos avanzados:
// - Obtener detalles creados por un usuario.
// - Consultar operativos disponibles y asignaciones en grupo.
// - Crear operativos junto con persona asociada.
// - Actualización parcial y eliminación de asignaciones de grupo.
@Injectable({
	providedIn: 'root'
})
export class OperativeService extends GenericService<OperativeOptionsMod, OperativeMod> {

	constructor(http: HttpClient) {
		const urlBase = environment.apiURL + 'api/Operating/';
		super(http, urlBase);
	}

	getAllDetatilsByCreate(id: number): Observable<OperativeDetailsMod[]> {
		return this.http.get<OperativeDetailsMod[]>(`${this.baseUrl}GetAllDetailsByCreatedId/${id}`);
	}

	getAllOperativesAvailable(areaManagerId: number): Observable<OperativeAvailableMod[]> {
		return this.http.get<OperativeAvailableMod[]>(`${this.baseUrl}GetAllOperativesAvailable/${areaManagerId}`);
	}

	getAllOperativesAssignments(groupId: number): Observable<OperativeAssignmentMod[]> {
		return this.http.get<OperativeAssignmentMod[]>(`${this.baseUrl}GetAssignmentsAsync/${groupId}`);
	}

	createWithOperative(request: OperativeCreateRequestMod): Observable<ApiResponse<OperativeMod>> {
		return this.http.post<ApiResponse<OperativeMod>>(
			`${environment.apiURL}api/OperativeRegistration/Create-With-Operative`,
			request
		);
	}

	partialUpdate(operativeData: OperativePartialGpOperativeMod): Observable<OperativeMod> {
		return this.http.patch<OperativeMod>(`${this.baseUrl}PartialUpdate/`, operativeData);
	}

	removeOpGrou(id: number): Observable<OperativeMod> {
		return this.http.patch<OperativeMod>(`${this.baseUrl}RemoveOpGroup/${id}`, null);
	}
}
