// ==================================================
// Modelos: Creación de zonas (ZoneCreateRequestMod)
// ==================================================
// Define el formato necesario para crear una nueva zona en el sistema,
// incluyendo la asignación de un responsable y su información personal.
// Incluye también un modelo de respuesta API reutilizable.

export interface ZoneCreateRequestMod {
  // Datos principales de la zona
  zoneName: string;
  zoneDescription: string;
  branchId: number | null;

  // Datos del encargado de la zona (Person)
  personName: string;
  personLastName: string;
  personEmail: string;
  personDocumentType: string;
  personDocumentNumber: string;
  personPhone: string;
}

// Estructura de respuesta API estándar utilizada en operaciones CRUD
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  field?: string;
}
