// ==================================================
// Modelos: Reportes de zona e historial de inventario
// ==================================================
// Estructuras de datos enfocadas en la generación de reportes detallados de
// zonas, ítems, verificaciones y evolución de estados a lo largo del tiempo.

// ==============================
// Reporte general por zona
// ==============================
export interface ZoneReport {
	zoneInfo: ZoneInfo;
	itemsByStatus: ItemsByStatus[];
	statusDistribution: Record<string, number>;
}

export interface ZoneInfo {
	id: number;
	name: string;
	totalItems: number;
	lastInventoryDate?: string;
	lastVerificationDate?: string;
	lastVerificationResult?: boolean;
}

export interface ItemsByStatus {
	status: string;
	count: number;
	percentage: number;
}

// ==============================
// Detalle de inventarios y verificaciones
// ==============================
export interface InventoryReport {
	id: number;
	date: string;
	operatingGroupName: string;
	itemsCount: number;
	observations: string;
	verificationResult?: boolean;
	verificationDate?: string;
	checkerName?: string;
}

export interface ItemStatusReport {
	id: number;
	code: string;
	name: string;
	category: string;
	currentStatus: string;
	lastInventoryDate: string;
	location: string;
}

export interface VerificationReport {
	id: number;
	inventoryDate: string;
	operatingGroupName: string;
	checkerName: string;
	result: boolean;
	verificationDate: string;
	observations: string;
}

// ==============================
// Evolución de estado de ítems
// ==============================
export interface ItemEvolutionReport {
	id: number;
	code: string;
	name: string;
	category: string;
	baseInventoryStatus: string;
	statusHistory: StatusHistory[];
	currentStatus: string;
	totalChanges: number;
	lastChangeDate?: string;
	trend: TrendType;
}

export interface StatusHistory {
	inventoryDate: string;
	operatingGroupName: string;
	status: string;
	hasChanged: boolean;
	changeType?: ChangeType;
}

// ==============================
// Tipos específicos
// ==============================
export type TrendType = 'mejorando' | 'empeorando' | 'estable';
export type ChangeType = 'mejoró' | 'empeoró' | 'sin cambio';
export type StatusType = 'En orden' | 'Reparación' | 'Dañado' | 'Perdido';

// ==============================
// Filtros aplicables a reportes
// ==============================
export interface ZoneReportFilters {
	startDate: Date | null;
	endDate: Date | null;
	selectedStatus: string[];
}

// ==============================
// Configuración de tablas
// ==============================
export interface TableColumn {
	key: string;
	label: string;
	sortable?: boolean;
}
