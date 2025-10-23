// ==================================================
// Modelos: Creación de sucursales (BranchCreateRequestMod)
// ==================================================
// Representa la estructura de datos requerida para crear una nueva sucursal
// junto con la información del subadministrador asignado. Incluye un modelo
// genérico de respuesta API reutilizable para este y otros endpoints.

export interface BranchCreateRequestMod {
  // Datos principales de la sucursal
  branchName: string;
  branchAddress: string;
  branchPhone: string;
  companyId: number | null;

  // Datos del subadministrador asociado (Person)
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
