// ===== SERVICIOS DE ENTIDADES =====
// Conjunto de servicios que heredan de GenericService<TWrite, TRead> para estandarizar
// las operaciones CRUD (GetAll, GetById, Create, Update, Delete).
// Cada servicio se especializa en una entidad del sistema, centralizando
// la comunicación con su respectiva API.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserHasCompanyMod, UserMod, UserOptionsMod, UserPartialUpdateMod } from '../../Models/SecurityModule/UserMod.model';
import { GenericService } from '../generic.service';

// Servicio de gestión de Usuarios del sistema.
// Además del CRUD genérico, incluye métodos específicos:
// - getAllJWT → listado seguro por JWT.
// - hasCompany → verifica si el usuario tiene empresa asociada.
// - partialUpdate → actualización parcial de datos del usuario.
// - changePassword → cambio de contraseña autenticado.
@Injectable({
	providedIn: 'root'
})
export class UserService extends GenericService<UserOptionsMod, UserMod> {

	constructor(http: HttpClient) {
		const urlBase = environment.apiURL + 'api/User/';
		super(http, urlBase);
	}

	getAllJWT(): Observable<UserMod[]> {
		return this.http.get<UserMod[]>(`${this.baseUrl}GetAllJWT/`);
	}

	// Ahora devuelve el DTO con hasCompany y companyId
	hasCompany(): Observable<UserHasCompanyMod> {
		return this.http.get<UserHasCompanyMod>(`${this.baseUrl}HasCompany/`);
	}

	partialUpdate(userData: UserPartialUpdateMod): Observable<UserMod> {
		return this.http.patch<UserMod>(`${this.baseUrl}PartialUpdate/`, userData);
	}

	changePassword(currentPassword: string, newPassword: string): Observable<void> {
		return this.http.post<void>(`${this.baseUrl}ChangePassword/`, {
			currentPassword,
			newPassword
		});
	}
}
