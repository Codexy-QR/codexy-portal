import { Injectable, inject } from '@angular/core';
import { BulkUploadRequestMod } from '../../../../Models/System/Others/BulkUpload/BulkUploadOperativeMod.model';
import { BulkUploadUtils } from '../../../../Utils/bulk-upload.utils';
import { AlertTotalService } from '../../../alert-total.service';
import { BulkUploadOperativeService } from '../BulkUpload/bulk-upload-operative.service';

// ===== SERVICIO DE IMPORTACIÓN MASIVA DE OPERATIVOS =====
// Su función es casi idéntica a la del servicio de ítems, pero orientada al registro
// masivo de personal operativo. Automatiza la validación, inserción y gestión de errores.
//
// Principales responsabilidades:
// ✅ Validar estructura y datos del archivo de operativos.
// ✅ Procesar e insertar registros en la base de datos.
// ✅ Mostrar informes detallados de errores y estadísticas del proceso.
// ✅ Integrarse con el flujo de alertas centralizadas.
@Injectable({
  providedIn: 'root'
})
export class BulkImportOperativeManagerService {

	// Inyección de servicios propios del proyecto
  private readonly bulkUploadService = inject(BulkUploadOperativeService);
  private readonly alertService = inject(AlertTotalService);

  /**
   * Procesa la importación completa de Excel
   */
  async processExcelImport(file: File, createByUserId: number): Promise<boolean> {
    if (createByUserId === 0) {
      await this.alertService.error('Error de Operative', 'No se pudo obtener la información del Creador de Operativos'); // 🔄 CAMBIO
      return false;
    }

    const request: BulkUploadRequestMod = {
      file: file,
      createdByUserId: createByUserId,
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
          loadingText: 'Guardando Operativos',
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
      const message = `Procesamiento parcial:\n• ${successful} operativos creados exitosamente\n• ${failed} operativos fallaron\n•`;

      await this.alertService.warning('Procesamiento Parcial', message);
    } else {
      // Todo exitoso
      const message = `• ${successful} operativos creados exitosamente\n•`;

      await this.alertService.success('¡Importación Exitosa!', message);
    }
  }
}
