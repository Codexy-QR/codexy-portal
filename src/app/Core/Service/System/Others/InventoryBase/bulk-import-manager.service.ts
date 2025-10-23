import { Injectable, inject } from '@angular/core';
import { BulkUploadRequestMod } from '../../../../Models/System/Others/BulkUpload/BulkUploadMod.model';
import { BulkUploadUtils } from '../../../../Utils/bulk-upload.utils';
import { AlertTotalService } from '../../../alert-total.service';
import { BulkUploadService } from '../BulkUpload/bulk-upload.service';

// ===== SERVICIO DE IMPORTACIÓN MASIVA DE ÍTEMS =====
// Gestiona el flujo completo del proceso de carga masiva de ítems a partir de un archivo Excel.
// Orquesta todas las etapas: validación, procesamiento, visualización de errores y resultados.
// Trabaja en conjunto con el servicio de alertas para mostrar feedback al usuario en tiempo real.
//
// Principales responsabilidades:
// ✅ Validar la estructura y los datos del archivo antes de procesarlos.
// ✅ Ejecutar la carga masiva y generar códigos QR automáticamente.
// ✅ Mostrar resúmenes detallados de errores y estadísticas del proceso.
// ✅ Integrarse con la interfaz de usuario mediante alertas interactivas.
@Injectable({
  providedIn: 'root'
})
export class BulkImportManagerService {

	// Inyección de servicios propios del proyecto
  private readonly bulkUploadService = inject(BulkUploadService);
  private readonly alertService = inject(AlertTotalService);

  /**
   * Procesa la importación completa de Excel
   */
  async processExcelImport(file: File, zoneId: number): Promise<boolean> {
    if (zoneId === 0) {
      await this.alertService.error('Error de zona', 'No se pudo obtener la información de la zona'); // 🔄 CAMBIO
      return false;
    }

    const request: BulkUploadRequestMod = {
      file: file,
      zoneId: zoneId,
      fileType: 'Excel'
    };

    try {
      // PASO 1: Validar archivo
      const validationSuccess = await this.validateFile(request);
      if (!validationSuccess) {
        return false; // Error o validación fallida
      }

      // PASO 2: Procesar archivo
      const processSuccess = await this.processFile(request);
      return processSuccess;

    } catch (error: any) {
      console.error('Error en carga masiva:', error);
      await this.alertService.error('Error inesperado', `Error inesperado: ${error.message}`); // 🔄 CAMBIO
      return false;
    }
  }

  /**
   * Valida el archivo Excel
   */
  private async validateFile(request: BulkUploadRequestMod): Promise<boolean> {
    try {
      // Usar withLoading del servicio unificado
      const validationResult = await this.alertService.withLoading(
        async () => {
          return await this.bulkUploadService.validateFile(request).toPromise();
        },
        {
          loadingTitle: 'Validando archivo...',
          loadingText: 'Verificando estructura y datos del Excel',
          showSuccessAlert: false // No mostrar alerta de éxito automática
        }
      );

      if (!validationResult?.success) {
        await this.alertService.error('Error de validación', validationResult?.message || 'Error en la validación'); // 🔄 CAMBIO
        return false;
      }

      // Si hay errores de validación, mostrarlos
      if (validationResult.data.failed > 0) {
        await this.showValidationErrors(validationResult.data);
        return false; // No continuar con el procesamiento
      }

      return true; // Validación exitosa

    } catch (error: any) {
      // Error ya manejado por withLoading
      return false;
    }
  }

  /**
   * Procesa el archivo después de validación exitosa
   */
  private async processFile(request: BulkUploadRequestMod): Promise<boolean> {
    try {
      const processResult = await this.alertService.withLoading(
        async () => {
          return await this.bulkUploadService.processFile(request).toPromise();
        },
        {
          loadingTitle: 'Procesando archivo...',
          loadingText: 'Guardando items y generando códigos QR',
          showSuccessAlert: false // No mostrar alerta de éxito automática
        }
      );

      if (!processResult?.success) {
        await this.alertService.error('Error de procesamiento', processResult?.message || 'Error en el procesamiento'); // 🔄 CAMBIO
        return false;
      }

      // Mostrar resultado del procesamiento
      await this.showProcessingResult(processResult.data);
      return true;

    } catch (error: any) {
      // Error ya manejado por withLoading
      return false;
    }
  }

  /**
   * Muestra errores de validación
   */
  private async showValidationErrors(validationData: any): Promise<void> {
    const { failed, successful, errors, processingTime } = validationData;
    const formattedTime = BulkUploadUtils.formatProcessingTime(processingTime);
    const errorSummary = BulkUploadUtils.getErrorSummary(errors);

    let errorMessage = `Se encontraron ${failed} errores de ${failed + successful} filas procesadas.\n\n`;

    // Resumen por campo
    errorMessage += 'Errores por campo:\n';
    errorSummary.slice(0, 3).forEach(({ field, count }) => {
      errorMessage += `• ${field}: ${count} errores\n`;
    });

    // Errores específicos
    if (errors.length > 0) {
      errorMessage += '\nPrimeros errores encontrados:\n';
      errors.slice(0, 5).forEach((error: any) => {
        errorMessage += `• Fila ${error.rowNumber}: ${error.errorMessage}\n`;
      });

      if (errors.length > 5) {
        errorMessage += `... y ${errors.length - 5} errores más\n`;
      }
    }

    errorMessage += `\nTiempo de validación: ${formattedTime}`;
    errorMessage += '\n\nPor favor, corrija los errores e intente nuevamente.';

    await this.alertService.error('Errores de Validación', errorMessage);
  }

  /**
   * Muestra el resultado del procesamiento
   */
  private async showProcessingResult(processData: any): Promise<void> {
    const { successful, failed, generatedCodes, processingTime } = processData;
    const formattedTime = BulkUploadUtils.formatProcessingTime(processingTime);

    if (failed > 0) {
      // Procesamiento parcial
      const message = `Procesamiento parcial:\n• ${successful} items creados exitosamente\n• ${failed} items fallaron\n• ${generatedCodes} códigos generados automáticamente\n\nTiempo: ${formattedTime}`;

      await this.alertService.warning('Procesamiento Parcial', message);
    } else {
      // Todo exitoso
      const message = `• ${successful} items creados exitosamente\n• ${generatedCodes} códigos generados automáticamente\n• Códigos QR generados para todos los items\n\nTiempo: ${formattedTime}`;

      await this.alertService.success('¡Importación Exitosa!', message);
    }
  }
}
