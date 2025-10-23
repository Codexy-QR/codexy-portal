// ==================================================
// Mapeos de categorías y estados de inventario
// ==================================================

// Diccionario que asocia el ID numérico de una categoría con su nombre descriptivo
export const CATEGORY_MAP: Record<number, string> = {
	1: 'Cómputo',
	2: 'Periféricos',
	3: 'Muebles',
	4: 'Laboratorio',
	5: 'Papelería',
	6: 'Comunicación',
	7: 'Electrodomésticos'
};

// Diccionario que asocia el ID numérico de un estado con su descripción
export const STATE_MAP: Record<number, string> = {
	1: 'En orden',
	2: 'Reparación',
	3: 'Dañado',
	4: 'Perdido'
};

// Configuración detallada para cada estado: ícono, etiqueta visible y clase CSS asociada
export const STATE_CONFIG: Record<string, { icon: string; label: string; class: string }> = {
	'En orden': {
		icon: 'check_circle',
		label: 'En orden',
		class: 'state-ok'
	},
	'Reparación': {
		icon: 'build',
		label: 'Reparación',
		class: 'state-repair'
	},
	'Dañado': {
		icon: 'report_problem',
		label: 'Dañado',
		class: 'state-damaged'
	},
	'Perdido': {
		icon: 'highlight_off',
		label: 'Perdido',
		class: 'state-lost'
	}
};
