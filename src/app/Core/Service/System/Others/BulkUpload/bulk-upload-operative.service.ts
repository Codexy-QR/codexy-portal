import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { BulkUploadRequestMod, ProcessResponseMod, ValidationResponseMod } from '../../../../Models/System/Others/BulkUpload/BulkUploadOperativeMod.model';

// ===== SERVICIO DE CARGA MASIVA DE OPERATIVOS =====
// Encargado de gestionar el flujo completo para importar operativos desde un archivo Excel.
// Este servicio automatiza las validaciones, el procesamiento y la inserción de registros
// en lote, reduciendo drásticamente el tiempo necesario para registrar múltiples operativos.
//
// Métodos principales:
// - validateFile: Realiza validaciones previas sobre el archivo (formato, columnas, datos requeridos).
// - processFile: Procesa el archivo validado y ejecuta la inserción masiva en la base de datos.
// - buildFormData: Prepara el objeto FormData necesario para el envío de archivos al backend.
@Injectable({
	providedIn: 'root'
})
export class BulkUploadOperativeService {

	private readonly baseUrl: string;

	constructor(private http: HttpClient) {
		this.baseUrl = environment.apiURL + 'api/OperativeBulkUpload/';
	}


	// Valida el archivo Excel antes del procesamiento
	validateFile(request: BulkUploadRequestMod): Observable<ValidationResponseMod> {
		const formData = this.buildFormData(request);
		return this.http.post<ValidationResponseMod>(`${this.baseUrl}ValidateTemplate`, formData);
	}

	// Procesa el archivo Excel y guarda los items en la base de datos
	processFile(request: BulkUploadRequestMod): Observable<ProcessResponseMod> {
		const formData = this.buildFormData(request);
		return this.http.post<ProcessResponseMod>(`${this.baseUrl}ProcessTemplate`, formData);
	}

	// Construye el FormData para el envío multipart/form-data
	// En bulk-upload-operative.service.ts
	private buildFormData(request: BulkUploadRequestMod): FormData {
		const formData = new FormData();
		formData.append('File', request.file);
		formData.append('CreatedByUserId', request.createdByUserId.toString()); // Cambiado de ZoneId a CreatedByUserId
		formData.append('FileType', request.fileType || 'Excel');

		return formData;
	}
}
