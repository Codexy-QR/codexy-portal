import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { BulkUploadRequestMod, ProcessResponseMod, ValidationResponseMod } from '../../../../Models/System/Others/BulkUpload/BulkUploadMod.model';

// ===== SERVICIO DE CARGA MASIVA DE ÍTEMS =====
// Similar al servicio de operativos, pero especializado en la importación masiva
// de ítems del inventario. Automatiza la validación, conversión y almacenamiento
// de grandes volúmenes de datos desde archivos Excel.
//
// Métodos principales:
// - validateFile: Verifica la estructura, formato y consistencia del archivo antes de procesarlo.
// - processFile: Ejecuta el procesamiento completo del archivo e inserta los ítems en la base de datos.
// - buildFormData: Construye el cuerpo de la solicitud para el envío multipart/form-data.
@Injectable({
	providedIn: 'root'
})
export class BulkUploadService {

	private readonly baseUrl: string;

	constructor(private http: HttpClient) {
		this.baseUrl = environment.apiURL + 'api/ItemBulkUpload/';
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
	private buildFormData(request: BulkUploadRequestMod): FormData {
    const formData = new FormData();
    formData.append('File', request.file);
    formData.append('ZoneId', request.zoneId.toString());
    formData.append('FileType', request.fileType || 'Excel');

    return formData;
  }
}
