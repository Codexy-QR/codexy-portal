// ==================================================
// Modelos: Operativos (Operative)
// ==================================================
// Estructuras que representan el personal operativo, sus asignaciones,
// detalles y relaciones con grupos operativos.

export interface OperativeOptionsMod {
	id: number;
	operatingId: number;
	createdByUserId: number;
	operationalGroupId?: number | null;
}

export interface OperativeMod {
	id: number;
	operatingId: number;
	operatingName: string;
	createdByUserId: number;
	createdByUserName: string;
	operatingGroupId?: number;
	operatingGroupName?: string;
}

export interface OperativeDetailsMod {
	id: number;
	operativeId: number;
	fullName: string;
	email: string;
	documentType: string;
	documentNumber: string;
	phone: string;
	createdByUserId: number;
	createdByUserName: string;
	operativeGroupId?: number | null;
	operativeGroupName?: string;
}

export interface OperativeAvailableMod {
	id: number;
	fullName: string;
}

export interface OperativePartialGpOperativeMod {
	id: number;
	operativeGroupId: number;
	groupName: string;
	dateStart: string;
	dateEnd: string;
}

export interface OperativeAssignmentMod {
	id: number;
	operativeId: number;
	operativeName: string;
	documentNumber: string;
	email: string;
	phone: string;
}
