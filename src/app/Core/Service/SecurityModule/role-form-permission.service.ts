// ===== SERVICIOS DE ENTIDADES =====
// Conjunto de servicios que heredan de GenericService<TWrite, TRead> para estandarizar
// las operaciones CRUD (GetAll, GetById, Create, Update, Delete).
// Cada servicio se especializa en una entidad del sistema, centralizando
// la comunicación con su respectiva API.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GenericService } from '../generic.service';
import { RoleFormPermissionOptionsMod, RoleFormPermissionMod } from '../../Models/SecurityModule/RoleFormPermissionMod.model';

// Servicios de seguridad relacionados con Formularios, Módulos y Permisos.
// Comparten el método extra getAllJWT() para obtener datos filtrados por autenticación JWT
@Injectable({
  providedIn: 'root'
})
export class RoleFormPermissionService extends GenericService<RoleFormPermissionOptionsMod, RoleFormPermissionMod> {

  constructor(http: HttpClient) {
    const urlBase = environment.apiURL + 'api/RoleFormPermission/';
    super(http, urlBase);
  }
  getAllJWT(): Observable<RoleFormPermissionMod[]>{
    return this.http.get<RoleFormPermissionMod[]>(`${this.baseUrl}GetAllJWT/`);
  }
}
