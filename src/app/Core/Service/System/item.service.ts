// ===== SERVICIOS DE ENTIDADES =====
// Conjunto de servicios que heredan de GenericService<TWrite, TRead> para estandarizar
// las operaciones CRUD (GetAll, GetById, Create, Update, Delete).
// Cada servicio se especializa en una entidad del sistema, centralizando
// la comunicación con su respectiva API.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ItemMod, ItemOptionsMod } from '../../Models/System/ItemMod.model';
import { GenericService } from '../generic.service';

// Servicio de gestión de Ítems del sistema.
// Opera únicamente con las operaciones CRUD genéricas.
@Injectable({
	providedIn: 'root'
})
export class ItemService extends GenericService<ItemOptionsMod, ItemMod> {

	constructor(http: HttpClient) {
		const urlBase = environment.apiURL + 'api/Item/';
		super(http, urlBase);
	}
}
