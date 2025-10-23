// ==================================================
// Utilidades para estado y progreso
// ==================================================
// Calcula el estado de una tarea en función de sus fechas y el progreso porcentual.

export function toDate(v: string | Date): Date {
	return v instanceof Date ? v : new Date(v);
}

// Devuelve el estado en base a la fecha actual (Programado, En Progreso o Completado)
export function calcStatus(startIso: string, endIso: string): 'Programado' | 'En Progreso' | 'Completado' {
	const now = new Date();
	const start = toDate(startIso);
	const end = toDate(endIso);
	if (now < start) return 'Programado';
	if (now > end) return 'Completado';
	return 'En Progreso';
}

// Calcula el porcentaje de progreso de una tarea
export function calcProgress(startIso: string, endIso: string): number {
	const now = new Date();
	const start = toDate(startIso).getTime();
	const end = toDate(endIso).getTime();
	if (now.getTime() <= start) return 0;
	if (now.getTime() >= end) return 100;
	return Math.round(((now.getTime() - start) / (end - start)) * 100);
}
