// ==================================================
// Modelos: Inventarios (Inventory)
// ==================================================
// Estructuras relacionadas con los procesos de inventario, su historial y
// opciones de configuración inicial.

export interface InventoryOptionsMod {
	date: string;
	observations: string;
	zoneId: number;
	operatingGroupId: number;
}

export interface InventoryMod {
	id: number;
	date: string;
	observations: string;
	zoneId: number;
	zoneName: string;
	operatingGroupId: number;
	operatingGroupName: string;
}

export interface InventoryHistoryMod {
	id: number;
	inventoryId: number;
	date: string;
	zoneName: string;
	verification: boolean;
	itemsCount: number;
	completedItems: number;
}
