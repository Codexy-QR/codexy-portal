// ===== SERVICIOS DE ENTIDADES =====
// Conjunto de servicios que heredan de GenericService<TWrite, TRead> para estandarizar
// las operaciones CRUD (GetAll, GetById, Create, Update, Delete).
// Cada servicio se especializa en una entidad del sistema, centralizando
// la comunicación con su respectiva API.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OpGroupByAreaManagerMod, OpGroupMod, OpGroupOptionsMod } from '../../Models/System/OpGroupMod';
import { GenericService } from '../generic.service';

// Servicio de gestión de Grupos Operativos.
// Métodos extra:
// - getByIdAreaManger → filtra grupos por encargado.
// - softDelete → eliminación lógica de grupos.
@Injectable({
	providedIn: 'root'
})
export class OpGroupService extends GenericService<OpGroupOptionsMod, OpGroupMod> {

	constructor(http: HttpClient) {
		const urlBase = environment.apiURL + 'api/OperatingGroup/';
		super(http, urlBase);
	}

	getByIdAreaManger(id: number | null): Observable<OpGroupByAreaManagerMod[]> {
		return this.http.get<OpGroupByAreaManagerMod[]>(`${this.baseUrl}GetByAreaManagerId/${id}`);
	}

	softDelete(id: number): Observable<any> {
		return this.http.delete(`${this.baseUrl}SoftDelete/${id}`);
	}
}
