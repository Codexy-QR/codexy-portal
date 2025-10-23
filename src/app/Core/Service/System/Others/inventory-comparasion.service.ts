import { Injectable } from '@angular/core';
import { InventoryItemCompareMod } from '../../../Models/System/Others/Dashboard.model';

export interface InventoryComparisonResult extends InventoryItemCompareMod {
	status: 'correct' | 'missing' | 'different-state' | 'damaged';
}

// ===== SERVICIO DE COMPARACIÓN DE INVENTARIOS =====
// Implementa la lógica de negocio encargada de analizar el estado real de los ítems
// frente al estado esperado en inventarios. Su objetivo es facilitar la detección
// de discrepancias y generar reportes analíticos.
//
// Funcionalidades clave:
// - compareInventoryItem: Evalúa un ítem individual y lo clasifica en uno de los estados:
//   "correct", "missing", "different-state" o "damaged".
// - processInventoryComparison: Procesa una lista completa de ítems y devuelve el resultado comparado.
// - getComparisonStatistics: Genera métricas globales (totales por estado, total general, etc.).
@Injectable({
	providedIn: 'root'
})
export class InventoryComparisonService {

	// Estados que se consideran como "perdido/faltante"
	private readonly MISSING_STATES = ['Perdido', 'Faltante', 'No encontrado'];

	// Estados que se consideran como "dañado"
	private readonly DAMAGED_STATES = ['Dañado', 'Averiado', 'Fuera de servicio'];

	// Compara un item individual y determina su status
	compareInventoryItem(item: InventoryItemCompareMod): InventoryComparisonResult {
		const status = this.determineStatus(item.expectedState, item.foundState);

		return {
			...item,
			status
		};
	}

	// Procesa un array completo de items de inventario
	processInventoryComparison(items: InventoryItemCompareMod[]): InventoryComparisonResult[] {
		return items.map(item => this.compareInventoryItem(item));
	}

	// Lógica principal para determinar el status basado en los estados
	private determineStatus(expectedState: string, foundState: string): 'correct' | 'missing' | 'different-state' | 'damaged' {
		// Normalizar strings para comparación (eliminar espacios y convertir a minúsculas)
		const normalizedExpected = expectedState.toLowerCase().trim();
		const normalizedFound = foundState.toLowerCase().trim();

		// 1. Si son exactamente iguales, es correcto
		if (normalizedExpected === normalizedFound) {
			return 'correct';
		}

		// 2. Si el estado encontrado indica que está perdido/faltante
		if (this.MISSING_STATES.some(state =>
			normalizedFound.includes(state.toLowerCase())
		)) {
			return 'missing';
		}

		// 3. Si el estado encontrado indica que está dañado
		if (this.DAMAGED_STATES.some(state =>
			normalizedFound.includes(state.toLowerCase())
		)) {
			return 'damaged';
		}

		// 4. En cualquier otro caso donde los estados no coincidan
		return 'different-state';
	}

	// Obtiene estadísticas de la comparación
	getComparisonStatistics(results: InventoryComparisonResult[]) {
		return {
			correctCount: results.filter(r => r.status === 'correct').length,
			missingCount: results.filter(r => r.status === 'missing').length,
			differentCount: results.filter(r => r.status === 'different-state').length,
			damagedCount: results.filter(r => r.status === 'damaged').length,
			totalCount: results.length
		};
	}
}
