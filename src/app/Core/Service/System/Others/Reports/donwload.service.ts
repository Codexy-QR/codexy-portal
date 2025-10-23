import { inject, Injectable } from '@angular/core';
import { AlertTotalService } from '../../../alert-total.service';

// ===== SERVICIO DE DESCARGA DE ARCHIVOS =====
// Este servicio centraliza toda la lógica necesaria para la descarga de reportes
// en diferentes formatos (Excel, PDF, etc.).
// Ofrece utilidades para construir nombres de archivos, manejar errores y
// generar enlaces temporales para descargas seguras.
@Injectable({
  providedIn: 'root'
})
export class DownloadService {

	// Inyección de servicios propios del proyecto
	private readonly alertService = inject(AlertTotalService)

  /**
   * Descarga un archivo desde un Blob
   */
  downloadFile(blob: Blob, fileName: string): void {
    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    // Disparar el click para descargar
    document.body.appendChild(link);
    link.click();

    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Obtiene el nombre del archivo desde los headers de respuesta
   */
  getFileNameFromResponse(contentDisposition: string): string {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(contentDisposition);

    if (matches != null && matches[1]) {
      let filename = matches[1].replace(/['"]/g, '');
      // Decodificar si está en formato URL
      return decodeURIComponent(filename);
    }

    return `reporte_${new Date().getTime()}`;
  }

  /**
   * Maneja errores de descarga
   */
  handleDownloadError(error: any, defaultFileName: string = 'reporte'): void {
    console.error('Error en la descarga:', error);
		this.alertService.error(defaultFileName, 'Error al descargar el archivo. Por favor, intente nuevamente.')
  }
}
