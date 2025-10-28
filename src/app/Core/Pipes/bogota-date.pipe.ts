// ==================================================
// Pipe: BogotaDatePipe
// ==================================================
// Transforma una fecha en un formato legible con zona horaria de Bogotá (America/Bogota).
// Permite personalizar el formato a través de opciones opcionales de Intl.DateTimeFormat.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'bogotaDate', standalone: true })
export class BogotaDatePipe implements PipeTransform {
	transform(
		value: Date | string | number | null | undefined,
		opts: Intl.DateTimeFormatOptions = {
			year: 'numeric', month: '2-digit', day: '2-digit',
			hour: '2-digit', minute: '2-digit', second: '2-digit',
			hour12: false
		}
	): string {
		if (value == null) return '';
		const d = value instanceof Date ? value : new Date(value);
		if (isNaN(d.getTime())) return '';
		return new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', ...opts }).format(d);
	}
}
