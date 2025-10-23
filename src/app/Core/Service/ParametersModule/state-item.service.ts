// ===== SERVICIOS DE ENTIDADES =====
// Conjunto de servicios que heredan de GenericService<TWrite, TRead> para estandarizar
// las operaciones CRUD (GetAll, GetById, Create, Update, Delete).
// Cada servicio se especializa en una entidad del sistema, centralizando
// la comunicación con su respectiva API.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CategoryItemMod } from '../../Models/ParametersModule/CategoryItemMod.mod';
import { GenericService } from '../generic.service';
import { StateItemMod } from '../../Models/ParametersModule/StateItemMod.mod';

// Servicio de gestión de Estados de Ítems.
// Opera directamente con la entidad StateItem usando métodos genéricos CRUD.
@Injectable({
	providedIn: 'root'
})
export class StateItemService extends GenericService<StateItemMod, StateItemMod> {

	constructor(http: HttpClient) {
		const urlBase = environment.apiURL + 'api/StateItem/'
		super(http, urlBase)
	}
}
