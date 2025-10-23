import { TrendType } from "../Models/System/Others/ZoneReportsMod.model";

// ==================================================
// Utilidades para manejo de fechas
// ==================================================
export class DateUtils {
	static formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	static formatDateTime(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	static isDateInRange(date: Date, startDate: Date | null, endDate: Date | null): boolean {
		if (startDate && date < startDate) return false;
		if (endDate && date > endDate) return false;
		return true;
	}
}

// ==================================================
// Utilidades para estados e iconos
// ==================================================
export class StatusUtils {
	private static readonly STATUS_ICONS: Record<string, string> = {
		'En orden': 'check_circle',
		'Reparación': 'build',
		'Dañado': 'warning',
		'Perdido': 'search_off'
	};

	private static readonly STATUS_CLASSES: Record<string, string> = {
		'En orden': 'status-ok',
		'Reparación': 'status-repair',
		'Dañado': 'status-damaged',
		'Perdido': 'status-lost'
	};

	private static readonly TREND_ICONS: Record<TrendType, string> = {
		'mejorando': 'trending_up',
		'empeorando': 'trending_down',
		'estable': 'trending_flat'
	};

	private static readonly TREND_LABELS: Record<TrendType, string> = {
		'mejorando': 'Mejorando',
		'empeorando': 'Empeorando',
		'estable': 'Estable'
	};

	static getStatusIcon(status: string): string {
		return this.STATUS_ICONS[status] || 'help';
	}

	static getStatusClass(status: string): string {
		return this.STATUS_CLASSES[status] || 'status-unknown';
	}

	static getTrendIcon(trend: TrendType): string {
		return this.TREND_ICONS[trend] || 'help';
	}

	static getTrendLabel(trend: TrendType): string {
		return this.TREND_LABELS[trend] || trend;
	}

	static getVerificationIcon(result: boolean): string {
		return result ? 'check_circle' : 'cancel';
	}

	static getVerificationClass(result: boolean): string {
		return result ? 'approved' : 'rejected';
	}

	static getVerificationText(result: boolean): string {
		return result ? 'Aprobado' : 'Rechazado';
	}
}

// ==================================================
// Utilidades para filtrado de datos
// ==================================================
export class FilterUtils {
	static filterByDateRange<T extends { date?: string; inventoryDate?: string; verificationDate?: string }>(
		items: T[],
		startDate: Date | null,
		endDate: Date | null,
		dateField: keyof T = 'date' as keyof T
	): T[] {
		if (!startDate && !endDate) return items;

		return items.filter(item => {
			const itemDateStr = item[dateField] as string;
			if (!itemDateStr) return true;

			const itemDate = new Date(itemDateStr);
			return DateUtils.isDateInRange(itemDate, startDate, endDate);
		});
	}

	static filterByStatus<T extends { currentStatus?: string; status?: string }>(
		items: T[],
		selectedStatuses: string[],
		statusField: keyof T = 'currentStatus' as keyof T
	): T[] {
		if (!selectedStatuses.length) return items;

		return items.filter(item => {
			const itemStatus = item[statusField] as string;
			return selectedStatuses.includes(itemStatus);
		});
	}
}

// ==================================================
// Utilidades para exportación de datos
// ==================================================
export class ExportUtils {
	static async exportToExcel(data: any[], filename: string): Promise<void> {
		// TODO: Implementar exportación a Excel real
		console.log(`Exportando ${data.length} registros a Excel: ${filename}`);

		// Simulación de descarga
		await new Promise(resolve => setTimeout(resolve, 1000));
		console.log('Exportación a Excel completada');
	}

	static async exportToPDF(data: any[], filename: string): Promise<void> {
		// TODO: Implementar exportación a PDF real
		console.log(`Exportando ${data.length} registros a PDF: ${filename}`);

		// Simulación de descarga
		await new Promise(resolve => setTimeout(resolve, 1000));
		console.log('Exportación a PDF completada');
	}

	static prepareDataForExport(data: any[], columns: string[]): any[] {
		return data.map(item => {
			const exportItem: any = {};
			columns.forEach(col => {
				exportItem[col] = item[col] || '';
			});
			return exportItem;
		});
	}
}

// ==================================================
// Utilidades de validación y filtros
// ==================================================
export class ValidationUtils {
	static isValidDateRange(startDate: Date | null, endDate: Date | null): boolean {
		if (!startDate || !endDate) return true;
		return startDate <= endDate;
	}

	static validateFilters(filters: any): string[] {
		const errors: string[] = [];

		if (filters.startDate && filters.endDate && !this.isValidDateRange(filters.startDate, filters.endDate)) {
			errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
		}

		return errors;
	}
}
