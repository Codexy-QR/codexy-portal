// ==================================================
// Modelos: Creación de Verificadores (CheckerCreateRequestMod)
// ==================================================
// Representa la estructura de datos requerida para crear un nuevo verificador
// asigndo a una sucursal. Incluye un modelo genérico de respuesta
// API reutilizable para este y otros endpoints.

export interface CheckerCreateRequestDTO {
	// Datos del Checker
  branchId: number;

	// Datos del Checker (Person)
  personName: string;
  personLastName: string;
  personEmail: string;
  personDocumentType: string;
  personDocumentNumber: string;
  personPhone: string;
}

// Estructura de respuesta genérica para operaciones API
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  field?: string;
}
