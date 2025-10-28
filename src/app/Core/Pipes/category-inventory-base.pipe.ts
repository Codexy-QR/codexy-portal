// ==================================================
// Pipe: CategoryInventoryBasePipe
// ==================================================
// Devuelve un objeto con ícono y etiqueta legible para representar cada categoría de inventario.
// Si la categoría no existe, la capitaliza y asigna un valor por defecto.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'categoryInventoryBase',
	standalone: true
})
export class CategoryInventoryBasePipe implements PipeTransform {

	transform(category: string): { icon: string; label: string } {
		if (category === 'all') {
			return { icon: 'all_inclusive', label: 'Todas' };
		}

		const categoryMap: Record<string, { icon: string; label: string }> = {
			Cómputo: { icon: 'computer', label: 'Cómputo' },
			Periféricos: { icon: 'keyboard_alt', label: 'Periféricos' },
			Muebles: { icon: 'table_bar', label: 'Muebles' },
			Laboratorio: { icon: 'biotech', label: 'Laboratorio' },
			Papelería: { icon: 'sticky_note_2', label: 'Papelería' },
			Comunicación: { icon: 'speaker_phone', label: 'Comunicación' },
			Electrodomésticos: { icon: 'tv_displays', label: 'Electrodomésticos' }
		};

		return categoryMap[category] || {
			icon: 'inventory_2',
			label: this.capitalizeFirstLetter(category)
		};
	}

	// Capitaliza la primera letra del texto
	private capitalizeFirstLetter(text: string): string {
		return text.charAt(0).toUpperCase() + text.slice(1);
	}
}
