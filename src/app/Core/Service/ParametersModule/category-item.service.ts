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

// Servicio de gestión de Categorías de Ítems.
// Extiende GenericService con operaciones CRUD estándar sobre CategoryItem.
@Injectable({
  providedIn: 'root'
})
export class CategoryItemService extends GenericService<CategoryItemMod, CategoryItemMod> {

  constructor(http: HttpClient) {
    const urlBase = environment.apiURL + 'api/Category/'
    super(http, urlBase)
  }
}
