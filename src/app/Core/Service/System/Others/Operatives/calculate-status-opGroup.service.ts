import { Injectable } from '@angular/core';
import { OperatingGroupDashboardMod } from '../../../../Models/System/Others/Dashboard.model';

// Interfaz para datos procesados en el frontend
export interface OperatingGroup extends OperatingGroupDashboardMod {
	status: 'scheduled' | 'in-progress' | 'completed';
}

// ===== SERVICIO DE CÁLCULO DE ESTADO DE GRUPOS OPERATIVOS =====
// Este servicio encapsula toda la lógica relacionada con el procesamiento
// y análisis de los grupos operativos en el frontend.
//
// Principales responsabilidades:
// ✅ Calcular el estado actual de cada grupo (programado, en progreso o completado).
// ✅ Enriquecer objetos con información adicional como duración, progreso o proximidad.
// ✅ Generar estadísticas agregadas a partir de múltiples grupos.
// ✅ Ordenar, filtrar y clasificar los grupos según diferentes criterios.
@Injectable({
	providedIn: 'root'
})
export class CalculateStatusOpGroupService {

	//  Procesa un grupo operativo individual y calcula su estado
	processOperatingGroup(group: OperatingGroupDashboardMod): OperatingGroup {
		const status = this.calculateStatus(group.scheduledStartDate, group.scheduledEndDate);

		return {
			...group,
			status
		};
	}

	//  Procesa un array completo de grupos operativos
	processOperatingGroups(groups: OperatingGroupDashboardMod[]): OperatingGroup[] {
		return groups.map(group => this.processOperatingGroup(group));
	}

	//  Calcula el estado basado en las fechas y la fecha actual
	private calculateStatus(
		startDate: string,
		endDate: string
	): 'scheduled' | 'in-progress' | 'completed' {
		const now = new Date();
		const start = new Date(startDate);
		const end = new Date(endDate);

		// Normalizar fechas a medianoche para comparación precisa
		now.setHours(0, 0, 0, 0);
		start.setHours(0, 0, 0, 0);
		end.setHours(0, 0, 0, 0);

		// 1. Si aún no ha comenzado
		if (now < start) {
			return 'scheduled';
		}

		// 2. Si está en progreso (entre fecha inicio y fin)
		if (now >= start && now <= end) {
			return 'in-progress';
		}

		// 3. Si ya terminó
		if (now > end) {
			return 'completed';
		}

		// 4. Estado por defecto (no debería llegar aquí)
		return 'scheduled';
	}

	//  Calcula estadísticas de los grupos operativos
	getGroupStatistics(groups: OperatingGroup[]) {
		return {
			scheduledCount: groups.filter(g => g.status === 'scheduled').length,
			inProgressCount: groups.filter(g => g.status === 'in-progress').length,
			completedCount: groups.filter(g => g.status === 'completed').length,
			totalCount: groups.length
		};
	}

	//  Obtiene grupos por estado específico
	getGroupsByStatus(groups: OperatingGroup[], status: OperatingGroup['status']): OperatingGroup[] {
		return groups.filter(group => group.status === status);
	}

	//  Ordena grupos por fecha de inicio
	sortGroupsByStartDate(groups: OperatingGroup[], ascending: boolean = true): OperatingGroup[] {
		return [...groups].sort((a, b) => {
			const dateA = new Date(a.scheduledStartDate).getTime();
			const dateB = new Date(b.scheduledStartDate).getTime();
			return ascending ? dateA - dateB : dateB - dateA;
		});
	}

	//  Verifica si un grupo está próximo a vencer (dentro de X días)
	isGroupUpcoming(group: OperatingGroup, daysThreshold: number = 7): boolean {
		if (group.status !== 'scheduled') return false;

		const now = new Date();
		const startDate = new Date(group.scheduledStartDate);
		const diffTime = startDate.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		return diffDays <= daysThreshold && diffDays >= 0;
	}

	//  Calcula la duración del grupo en días
	getGroupDuration(group: OperatingGroupDashboardMod): number {
		const start = new Date(group.scheduledStartDate);
		const end = new Date(group.scheduledEndDate);
		const diffTime = end.getTime() - start.getTime();
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
	}

	// Obtiene el progreso del grupo (para grupos en progreso)
	getGroupProgress(group: OperatingGroup): number {
		if (group.status !== 'in-progress') return 0;

		const now = new Date();
		const start = new Date(group.scheduledStartDate);
		const end = new Date(group.scheduledEndDate);

		const totalDuration = end.getTime() - start.getTime();
		const elapsed = now.getTime() - start.getTime();

		return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
	}
}
