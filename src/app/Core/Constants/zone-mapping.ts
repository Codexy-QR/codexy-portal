// ==================================================
// Mapeos de estados de zonas y su configuración visual
// ==================================================

// Diccionario que traduce los estados de zona del sistema a su representación en español
export const ZONE_STATE_MAP: Record<string, string> = {
	Available: 'Disponible',
	InInventory: 'En Inventario',
	InVerification: 'En Verificación'
};

// Configuración detallada para cada estado de zona: etiqueta, clase CSS e ícono representativo
export const ZONE_STATE_ESPECIFIC_MAP: Record<
	'Available' | 'InInventory' | 'InVerification',
	{ label: string; cssClass: string; icon: string }
> = {
	Available: {
		label: 'Disponible',
		cssClass: 'state-disponible',
		icon: 'fiber_manual_record'
	},
	InInventory: {
		label: 'En Inventario',
		cssClass: 'state-en-inventario',
		icon: 'fiber_manual_record'
	},
	InVerification: {
		label: 'En Verificación',
		cssClass: 'state-en-verificación',
		icon: 'fiber_manual_record'
	}
};
