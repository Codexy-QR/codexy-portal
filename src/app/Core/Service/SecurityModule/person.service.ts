// ===== SERVICIOS DE ENTIDADES =====
// Conjunto de servicios que heredan de GenericService<TWrite, TRead> para estandarizar
// las operaciones CRUD (GetAll, GetById, Create, Update, Delete).
// Cada servicio se especializa en una entidad del sistema, centralizando
// la comunicación con su respectiva API.

import { Injectable } from '@angular/core';
import { GenericService } from '../generic.service';
import { PersonAvailableMod, PersonMod } from '../../Models/SecurityModule/PersonMod.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

// Servicio de gestión de Personas dentro del sistema de seguridad.
// Extiende CRUD genérico y añade:
// - getAvailable → retorna personas disponibles para asignación.
// - getAllJWT → listado protegido por JWT.
@Injectable({
  providedIn: 'root'
})
export class PersonService extends GenericService<PersonMod, PersonMod> {
  constructor(http:HttpClient){
    const baseURL = environment.apiURL + 'api/Person/'
    super(http, baseURL);
  }

  getAvailable(): Observable<PersonAvailableMod[]>{
    return this.http.get<PersonAvailableMod[]>(`${this.baseUrl}GetAvailable/`);
  }

  getAllJWT(): Observable<PersonMod[]>{
    return this.http.get<PersonMod[]>(`${this.baseUrl}GetAllJWT/`);
  }
}
