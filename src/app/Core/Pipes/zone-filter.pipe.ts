// ==================================================
// Pipe: ZoneFilterPipe
// ==================================================
// Filtra zonas según un texto de búsqueda, comparando por nombre, responsable o número de ítems.
// Normaliza el texto para mejorar la coincidencia.

import { Pipe, PipeTransform } from '@angular/core';
import { BranchDetailsMod } from '../Models/System/BranchMod.model';

@Pipe({
	name: 'zoneFilter',
	standalone: true
})
export class ZoneFilterPipe implements PipeTransform {
	transform(zones: BranchDetailsMod['zones'] | undefined, searchText: string): BranchDetailsMod['zones'] {
		if (!zones) return [];
		if (!searchText) return zones;

		const normalizedSearch = this.normalizeText(searchText.toLowerCase());

		return zones.filter(zone =>
			this.normalizeText(zone.name.toLowerCase()).includes(normalizedSearch) ||
			this.normalizeText(zone.inChargeFullName.toLowerCase()).includes(normalizedSearch) ||
			zone.itemsCount.toString().includes(normalizedSearch)
		);
	}

	// Normaliza texto para búsqueda
	private normalizeText(text: string): string {
		return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	}
}
