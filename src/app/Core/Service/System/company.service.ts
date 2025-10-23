// ===== SERVICIOS DE ENTIDADES =====
// Conjunto de servicios que heredan de GenericService<TWrite, TRead> para estandarizar
// las operaciones CRUD (GetAll, GetById, Create, Update, Delete).
// Cada servicio se especializa en una entidad del sistema, centralizando
// la comunicación con su respectiva API.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CompanyMod, CompanyOptionsMod, CompanyPartialUpdateMod } from '../../Models/System/CompanyMod.model';
import { GenericService } from '../generic.service';

// Servicio de gestión de Empresas.
// Extiende CRUD genérico y añade:
// - createCompany → simplifica la creación estándar.
// - partialUpdate → actualización parcial de datos.

@Injectable({
	providedIn: 'root'
})
export class CompanyService extends GenericService<CompanyOptionsMod, CompanyMod> {

	constructor(http: HttpClient) {
		const urlBase = environment.apiURL + 'api/Company/';
		super(http, urlBase);
	}

	createCompany(companyData: CompanyOptionsMod): Observable<CompanyMod> {
		return this.create(companyData);
	}

	partialUpdate(companyData: CompanyPartialUpdateMod): Observable<CompanyMod> {
		return this.http.patch<CompanyMod>(`${this.baseUrl}PartialUpdate/`, companyData);
	}
}

