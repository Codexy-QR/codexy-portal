// ===== SERVICIOS DE ENTIDADES =====
// Conjunto de servicios que heredan de GenericService<TWrite, TRead> para estandarizar
// las operaciones CRUD (GetAll, GetById, Create, Update, Delete).
// Cada servicio se especializa en una entidad del sistema, centralizando
// la comunicación con su respectiva API.

import { Injectable } from '@angular/core';
import { GenericService } from '../generic.service';
import { UserRoleMod, UserRoleOptionsMod } from '../../Models/SecurityModule/UserRoleMod.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

// Servicios de seguridad relacionados con Formularios, Módulos y Permisos.
// Comparten el método extra getAllJWT() para obtener datos filtrados por autenticación JWT
@Injectable({
  providedIn: 'root'
})
export class UserRoleService extends GenericService<UserRoleOptionsMod, UserRoleMod> {

  constructor(http: HttpClient) {
    const urlBase = environment.apiURL + 'api/UserRole/';
    super(http, urlBase);
  }

  getAllJWT(): Observable<UserRoleMod[]>{
    return this.http.get<UserRoleMod[]>(`${this.baseUrl}GetAllJWT/`);
  }
}
