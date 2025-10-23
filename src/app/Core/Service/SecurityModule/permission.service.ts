// ===== SERVICIOS DE ENTIDADES =====
// Conjunto de servicios que heredan de GenericService<TWrite, TRead> para estandarizar
// las operaciones CRUD (GetAll, GetById, Create, Update, Delete).
// Cada servicio se especializa en una entidad del sistema, centralizando
// la comunicación con su respectiva API.

import { Injectable } from '@angular/core';
import { GenericService } from '../generic.service';
import { PermissionMod } from '../../Models/SecurityModule/PermissionMod.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

// Servicios de seguridad relacionados con Formularios, Módulos y Permisos.
// Comparten el método extra getAllJWT() para obtener datos filtrados por autenticación JWT
@Injectable({
  providedIn: 'root'
})
export class PermissionService extends GenericService<PermissionMod, PermissionMod> {

  constructor(http: HttpClient) {
    const urlBase = environment.apiURL + 'api/Permission/'
    super(http, urlBase)
  }

  getAllJWT(): Observable<PermissionMod[]>{
    return this.http.get<PermissionMod[]>(`${this.baseUrl}GetAllJWT/`);
  }
}
