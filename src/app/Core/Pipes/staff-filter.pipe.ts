// ==================================================
// Pipe: StaffFilterPipe
// ==================================================
// Filtra una lista de elementos (por ejemplo, personal) según un texto de búsqueda general.
// Busca coincidencias en todos los valores del objeto.

import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'staffFilter',
	standalone: true
})
@Injectable({
	providedIn: 'root'
})
export class StaffFilterPipe implements PipeTransform {
	transform(items: any[], searchText: string): any[] {
		if (!items || !searchText) {
			return items;
		}

		const normalizedSearch = this.normalizeText(searchText.toLowerCase());

		return items.filter(item =>
			Object.values(item).some(value =>
				value && this.normalizeText(value.toString().toLowerCase()).includes(normalizedSearch)
			)
		);
	}

	// Normaliza texto eliminando tildes
	private normalizeText(text: string): string {
		return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	}
}
