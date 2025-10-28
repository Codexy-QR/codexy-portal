// ==================================================
// Modelos: Verificadores (Checker)
// ==================================================
// Estructuras que representan el personal de verificacion, sus asignaciones y detalles.

export interface CheckerOptionsMod {
	id: number;
	userId: number;
	branchId: number;
}

export interface CheckerMod {
	id: number;
	userId: number;
	userName: string;
	branchId: number;
	bbranchName: string;
}

export interface CheckersInBranchMod {
	id: number
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}
