// ==================================================
// Modelos: Verificaciones (Verification)
// ==================================================
// Representa el proceso de verificación de inventarios, incluyendo
// resultados, observaciones y la relación con los verificadores.

export interface VerificationOptionsMod {
	id: number;
	result?: boolean;
	date: string;
	observations?: string;
	inventaryId: number;
	checkerId: number;
}

export interface VerificationMod {
	id: number;
	result?: boolean;
	date: string;
	observations?: string;
	inventaryId: number;
	inventaryObservations?: string;
	checkerId: number;
	checkerName: string;
}

export interface VerificationsByCheckerMod {
	id: number;
	date: string;
	zoneName: string;
	operatingGroupName: string;
	result: boolean;
	observations?: string;
}
