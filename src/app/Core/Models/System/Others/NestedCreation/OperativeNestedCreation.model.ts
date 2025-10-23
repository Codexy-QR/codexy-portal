// ==================================================
// Modelos: Creación de operativos (OperativeCreateRequestMod)
// ==================================================
// Define los datos requeridos para registrar un nuevo operativo en el sistema,
// incluyendo la relación con el usuario creador y la información personal del
// operativo. También se incluye un modelo de respuesta API genérico.

export interface OperativeCreateRequestMod {
  // Identificador del usuario que crea el operativo
  createdByUserId: number;

  // Datos personales del operativo
  personName: string;
  personLastName: string;
  personEmail: string;
  personDocumentType: string;
  personDocumentNumber: string;
  personPhone: string;
}

// Estructura genérica de respuesta del backend
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  field?: string;
}
