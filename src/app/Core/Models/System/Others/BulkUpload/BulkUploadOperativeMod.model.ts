// ==================================================
// Modelos: Carga masiva de operativos (Bulk Upload - Operatives)
// ==================================================
// Estructuras utilizadas en el proceso de carga masiva de personal operativo,
// incluyendo resultados de validación, creación de usuarios y reportes de errores.

export interface BulkUploadErrorMod {
  rowNumber: number;          // Número de fila donde ocurrió el error
  errorMessage: string;       // Mensaje descriptivo del error
  field: string;              // Campo afectado
  rawData: string;            // Datos originales de la fila
}

// Respuesta tras la validación del archivo de operativos
export interface ValidationResponseMod {
  success: boolean;
  message: string;
  data: {
    totalRows: number;               // Total de registros procesados
    successful: number;              // Total de registros válidos
    failed: number;                  // Total de registros con errores
    validRows: number;               // Total de registros listos para crear
    errors: BulkUploadErrorMod[];    // Lista de errores de validación
    processingTime: string;          // Duración del proceso de validación
  };
}

// Respuesta tras el procesamiento completo de la carga de operativos
export interface ProcessResponseMod {
  success: boolean;
  message: string;
  data: {
    totalRows: number;                   // Total de filas procesadas
    successful: number;                  // Total de operativos creados exitosamente
    failed: number;                      // Total de registros con errores
    generatedCodes: number;              // Total de credenciales generadas
    processedOperatives: ProcessedOperativeMod[]; // Lista detallada de operativos procesados
    errors: BulkUploadErrorMod[];       // Lista de errores detectados
    processingTime: string;             // Tiempo total de procesamiento
  };
}

// Información detallada de cada operativo procesado
export interface ProcessedOperativeMod {
  personId: number;
  userId: number;
  operativeId: number;
  documentNumber: string;
  username: string;
  generatedPassword: string;
  fullName: string;
  success: boolean;
  errorMessage: string | null;
  codeGenerated: boolean;
}

// Estructura de la solicitud de carga masiva de operativos
export interface BulkUploadRequestMod {
  file: File;                 // Archivo con los registros de operativos
  createdByUserId: number;    // ID del usuario que realiza la carga
  fileType?: string;          // Tipo de archivo cargado
}
