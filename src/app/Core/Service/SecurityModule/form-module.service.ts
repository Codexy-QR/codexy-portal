// ===== SERVICIOS DE ENTIDADES =====
// Conjunto de servicios que heredan de GenericService<TWrite, TRead> para estandarizar
// las operaciones CRUD (GetAll, GetById, Create, Update, Delete).
// Cada servicio se especializa en una entidad del sistema, centralizando
// la comunicación con su respectiva API.

import { Injectable } from '@angular/core';
import { GenericService } from '../generic.service';
import { FormModuleMod, FormModuleOptionsMod } from '../../Models/SecurityModule/FormModuleMod.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

// Servicios de seguridad relacionados con Formularios, Módulos y Permisos.
// Comparten el método extra getAllJWT() para obtener datos filtrados por autenticación JWT
@Injectable({
  providedIn: 'root'
})
export class FormModuleService extends GenericService<FormModuleOptionsMod, FormModuleMod> {

  constructor(http: HttpClient) {
    const urlBase = environment.apiURL + 'api/FormModule/';
    super(http, urlBase);
  }

  getAllJWT(): Observable<FormModuleMod[]>{
    return this.http.get<FormModuleMod[]>(`${this.baseUrl}GetAllJWT/`);
  }
}
