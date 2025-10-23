// ==================================================
// Modelos: Detalle de verificación (VerificationDetailResponse)
// ==================================================
// Estructuras que representan el resultado detallado de una verificación
// realizada sobre un inventario, incluyendo el verificador, la sucursal
// y la información del inventario inspeccionado.

export interface VerificationDetailResponse {
	id: number;                                   // ID de la verificación
	result: boolean;                              // Resultado de la verificación (true = aprobado)
	date: string;                                 // Fecha en que se realizó
	observations: string | null;                  // Observaciones adicionales
	checker: {
		id: number;                                 // ID del verificador
		user: {
			id: number;                               // ID del usuario asociado al verificador
			name: string;                             // Nombre completo
			email: string;                            // Correo electrónico
		};
		branch: {
			id: number;                               // ID de la sucursal
			name: string;                             // Nombre de la sucursal
		};
	};
	inventory: {
		id: number;                                 // ID del inventario asociado
		date: string;                               // Fecha del inventario
		observations: string | null;                // Observaciones generales
		operatingGroup: {
			id: number;                               // ID del grupo operativo responsable
			name: string;                             // Nombre del grupo operativo
		};
		itemsCount: number;                         // Cantidad total de ítems revisados
	};
}
