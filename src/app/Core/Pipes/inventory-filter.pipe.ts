// ==================================================
// Pipe: InventoryFilterPipe
// ==================================================
// Filtra ítems de zona por nombre, serial, categoría o estado.
// Aplica normalización para coincidencias insensibles a acentos y mayúsculas.

import { Pipe, PipeTransform } from '@angular/core';
import { ZoneItemMod } from '../Models/System/ZoneMod.model';

@Pipe({
	name: 'inventoryFilter',
	standalone: true
})
export class InventoryFilterPipe implements PipeTransform {
	transform(items: ZoneItemMod[], searchText: string, categoryFilter: string, stateFilter: string): ZoneItemMod[] {
		if (!items) return [];

		let filteredItems = items;

		// Filtro por texto
		if (searchText) {
			const normalizedSearch = this.normalizeText(searchText.toLowerCase());
			filteredItems = filteredItems.filter(item =>
				this.normalizeText(item.name.toLowerCase()).includes(normalizedSearch) ||
				(item.code && this.normalizeText(item.code.toLowerCase()).includes(normalizedSearch))
			);
		}

		// Filtro por categoría
		if (categoryFilter && categoryFilter !== 'all') {
			filteredItems = filteredItems.filter(item => item.category === categoryFilter);
		}

		// Filtro por estado
		if (stateFilter && stateFilter !== 'all') {
			filteredItems = filteredItems.filter(item => item.state === stateFilter);
		}

		return filteredItems;
	}

	// Normaliza texto para búsqueda
	private normalizeText(text: string): string {
		return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	}
}
