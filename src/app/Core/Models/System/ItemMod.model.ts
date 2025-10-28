// ==================================================
// Modelos: Ítems de inventario (Item)
// ==================================================
// Representa los elementos individuales del inventario, sus propiedades,
// estados y versiones simplificadas para vistas base.

export interface ItemMod {
	id: number;
	code: string;
	name: string;
	description: string;
	categoryItemId: number;
	categoryName: string;
	stateItemId: number;
	stateItemName: string;
	zoneId: number;
	zoneName: string;
	qrPath: string;
}

export interface ItemOptionsMod {
	id: number;
	code: string;
	name: string;
	description: string;
	categoryItemId: number;
	stateItemId: number;
	zoneId: number;
}

export interface ItemInventoryBaseSimpleMod {
	id: number;
	code: string;
	name: string;
	description: string;
	categoryName: string;
	stateName: string;
}
