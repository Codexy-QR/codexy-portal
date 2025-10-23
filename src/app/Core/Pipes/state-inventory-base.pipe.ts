// ==================================================
// Pipe: StateInventoryBasePipe
// ==================================================
// Devuelve la configuración visual correspondiente a un estado de inventario (ícono, etiqueta y clase).
// Si el estado no existe, retorna un valor por defecto.

import { Pipe, PipeTransform } from '@angular/core';
import { STATE_CONFIG } from '../Constants/item-mappings';

@Pipe({
	name: 'stateInventoryBase',
	standalone: true
})
export class StateInventoryBasePipe implements PipeTransform {

	transform(state: string): { icon: string; label: string; class: string } {
		if (state === 'all') {
			return {
				icon: 'all_inclusive',
				label: 'Todos',
				class: 'state-all'
			};
		}

		return STATE_CONFIG[state] || {
			icon: 'help_outline',
			label: 'Desconocido',
			class: 'state-default'
		};
	}
}
