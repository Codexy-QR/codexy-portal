// ==================================================
// Modelos: Dashboard general, por sede y por zona
// ==================================================
// Estructuras de datos utilizadas en los paneles de visualización del sistema.
// Permiten representar métricas globales, estadísticas por sede o zona, estado
// de ítems y grupos operativos en ejecución.

// ==============================
// Dashboard de compañía (global)
// ==============================
export interface DashboardModel {
	totalBranches: number;
	totalZones: number;
	totalItems: number;
	usersByRole: Record<string, number>;
	itemsByCategory: Record<string, number>;
	itemsByState: Record<string, number>;
}

// ==============================
// Dashboard por sede (branch)
// ==============================
export interface DashboardBranchModel {
	branchId: number;
	branchName: string;
	address: string;
	phone: string;
	totalZones: number;
	totalItems: number;
	totalZoneManagers: number;
	totalOperatives: number;
	inventoriesThisMonth: number;
	zones: ZoneMod[];
	itemsByCategory: Record<string, number>;
	itemsByState: Record<string, number>;
	recentInventories: RecentInventoryMod[];
}

export interface ZoneMod {
	zoneId: number;
	zoneName: string;
	state: string;
	itemsCount: number;
	inChargeUserId: number;
	inChargeFullName: string;
	inChargeEmail: string;
}

export interface RecentInventoryMod {
	inventaryId: number;
	date: string; // Fecha ISO (ej: 2025-09-02T09:00:00)
	zoneName: string;
	operatingGroupName: string;
	verificationResult: boolean;
}

// ==============================
// Dashboard por zona específica
// ==============================
export interface ZoneInfoMod {
	zoneId: number;
	zoneName: string;
	state: string;
	totalItems: number;
	inventoriesThisMonth: number;
	lastInventoryDate: string; // Fecha ISO
	zoneManagerName: string;
}

export interface ItemStatusMod {
	state: string;
	count: number;
}

export interface InventoryItemCompareMod {
	itemName: string;
	category: string;
	expectedState: string;
	foundState: string;
	operatingGroupName: string;
}

export interface OperatingGroupDashboardMod {
	groupId: number;
	groupName: string;
	scheduledStartDate: string;
	scheduledEndDate: string;
	zoneManagerName: string;
	operatives: string[];
}

export interface ZoneDashboard {
	zoneInfo: ZoneInfoMod;
	itemsStatus: ItemStatusMod[];
	inventoryComparison: InventoryItemCompareMod[];
	operatingGroups: OperatingGroupDashboardMod[];
}
