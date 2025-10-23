// ==================================================
// Modelos: Grupos Operativos (OpGroup)
// ==================================================
// Representan grupos de trabajo operativo, incluyendo opciones de
// creación, detalles y asociaciones con gestores de área.

export interface OpGroupOptionsMod {
	id: number;
	name: string;
	dateStart: string;
	dateEnd: string;
	areaManagerId: number;
}

export interface OpGroupMod {
	id: number;
	name: string;
	dateStart: string;
	dateEnd: string;
	areaManagerId: number;
	areaManagerName: string;
}

export interface OpGroupByAreaManagerMod {
	id: number;
	name: string;
}
