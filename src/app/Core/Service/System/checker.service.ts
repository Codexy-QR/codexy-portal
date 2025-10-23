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
import { CheckerMod, CheckerOptionsMod, CheckersInBranchMod } from '../../Models/System/CheckerMod.model';
import { ApiResponse, CheckerCreateRequestDTO } from '../../Models/System/Others/NestedCreation/CheckerNestedCreation.model';

// Servicio de gestión de Verificadores.
// Amplía CRUD genérico con métodos clave:
// - Listar verificadores por sucursal.
// - Crear verificador asignado a una sucursal (flujo anidado).
@Injectable({
	providedIn: 'root'
})
export class CheckerService extends GenericService<CheckerOptionsMod, CheckerMod> {

	constructor(http: HttpClient) {
		const urlBase = environment.apiURL + 'api/Checker/';
		super(http, urlBase);
	}

	getByBranch(id: number | null): Observable<CheckersInBranchMod[]> {
		return this.http.get<CheckersInBranchMod[]>(`${this.baseUrl}GetByBranch/${id}`);
	}

	createByBranch(request: CheckerCreateRequestDTO): Observable<ApiResponse<CheckerMod>> {
		return this.http.post<ApiResponse<CheckerMod>>(
			`${environment.apiURL}api/CheckerRegistration/Create-By-Branch`,
			request
		);
	}
}
