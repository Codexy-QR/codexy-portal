import { Injectable, inject } from '@angular/core';
import { PrintExportService } from './print-export.service';
import { InventoryManagerService } from '../inventory-manager.service';
import { ItemService } from '../../../item.service';

// ===== SERVICIO DE PUENTE PARA EXPORTACIÓN DE INVENTARIO =====
// Este servicio actúa como "conector" entre la capa de datos del inventario
// (InventoryManagerService), el servicio de ítems (ItemService) y la lógica
// de exportación/impresión (PrintExportService).
//
// Principales responsabilidades:
// ✅ Reunir todos los ítems del inventario actual desde el estado global.
// ✅ Consultar información adicional (ej. rutas QR) de cada ítem individual.
// ✅ Preparar un conjunto enriquecido de datos para exportación.
// ✅ Iniciar la generación del documento imprimible.
@Injectable({
	providedIn: 'root'
})
export class ExportBridgeService {

	// Inyección de servicios propios del proyecto
	private readonly inventoryManager = inject(InventoryManagerService);
	private readonly itemService = inject(ItemService);
	private readonly printExportService = inject(PrintExportService);

	async exportInventoryForPrint(): Promise<void> {
		const items = this.inventoryManager.allItems();
		const itemsWithDetails: any[] = [];

		for (const item of items) {
			try {
				const details = await this.getItemDetails(Number(item.id));
				if (details && details.qrPath) {
					itemsWithDetails.push(details);
				}
			} catch (error) {
				console.error(`Error obteniendo detalles del item ${item.id}:`, error);
			}
		}

		if (itemsWithDetails.length > 0) {
			this.printExportService.openPrintableDocument(itemsWithDetails);
		}
	}

	private getItemDetails(itemId: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.itemService.getById(itemId).subscribe({
				next: resolve,
				error: reject
			});
		});
	}
}
