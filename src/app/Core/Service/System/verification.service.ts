// ===== SERVICIOS DE ENTIDADES =====
// Conjunto de servicios que heredan de GenericService<TWrite, TRead> para estandarizar
// las operaciones CRUD (GetAll, GetById, Create, Update, Delete).
// Cada servicio se especializa en una entidad del sistema, centralizando
// la comunicación con su respectiva API.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GenericService } from '../generic.service';
import { VerificationMod, VerificationOptionsMod, VerificationsByCheckerMod } from '../../Models/System/Verification.model';
import { VerificationDetailResponse } from '../../Models/System/Others/AreaManagerInventories/verificationDetail.model';

// Servicio de gestión de Verificaciones de inventario.
// Además del CRUD estándar, permite:
// - Consultar detalle completo de una verificación con checker e inventario
@Injectable({
	providedIn: 'root'
})
export class VerificationService extends GenericService<VerificationOptionsMod, VerificationMod> {

	constructor(http: HttpClient) {
		const urlBase = environment.apiURL + 'api/Verification/';
		super(http, urlBase);
	}

	getVerificationDetail(verificationId: number): Observable<VerificationDetailResponse> {
		return this.http.get<VerificationDetailResponse>(
			`${this.baseUrl}GetVerificationDetail/${verificationId}`
		);
	}

	getVerificationsByChecker(checkerId: number): Observable<VerificationsByCheckerMod[]> {
		return this.http.get<VerificationsByCheckerMod[]>(
			`${this.baseUrl}GetVerificationsByCheckerId/${checkerId}`
		);
	}
}
