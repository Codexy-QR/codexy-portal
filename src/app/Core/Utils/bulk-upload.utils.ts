// ==================================================
// Utilidades para procesamiento de carga masiva
// ==================================================
// Incluyen métodos para formatear tiempos, agrupar errores, obtener resúmenes y validar errores críticos.

import { BulkUploadErrorMod } from "../Models/System/Others/BulkUpload/BulkUploadMod.model";

export class BulkUploadUtils {

	// Formatea el tiempo de procesamiento a un formato legible (minutos y segundos)
	static formatProcessingTime(processingTime: string): string {
		const parts = processingTime.split(':');
		if (parts.length >= 3) {
			const minutes = parseInt(parts[1]);
			const seconds = parseFloat(parts[2]);
			return minutes > 0 ? `${minutes}m ${seconds.toFixed(1)}s` : `${seconds.toFixed(1)}s`;
		}
		return processingTime;
	}

	// Agrupa errores por campo para mejorar su visualización
	static groupErrorsByField(errors: BulkUploadErrorMod[]): Record<string, BulkUploadErrorMod[]> {
		return errors.reduce((acc, error) => {
			const field = error.field || 'General';
			if (!acc[field]) acc[field] = [];
			acc[field].push(error);
			return acc;
		}, {} as Record<string, BulkUploadErrorMod[]>);
	}

	// Obtiene un resumen con la cantidad de errores por campo
	static getErrorSummary(errors: BulkUploadErrorMod[]): { field: string; count: number }[] {
		const fieldCounts: Record<string, number> = {};
		errors.forEach(error => {
			const field = error.field || 'General';
			fieldCounts[field] = (fieldCounts[field] || 0) + 1;
		});
		return Object.entries(fieldCounts)
			.map(([field, count]) => ({ field, count }))
			.sort((a, b) => b.count - a.count);
	}

	// Verifica si existen errores críticos que bloquean el proceso
	static hasCriticalErrors(errors: BulkUploadErrorMod[]): boolean {
		const criticalFields = ['Excel', 'General'];
		return errors.some(error => criticalFields.includes(error.field));
	}
}
