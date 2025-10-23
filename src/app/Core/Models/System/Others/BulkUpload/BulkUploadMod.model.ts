// ==================================================
// Modelos: Carga masiva de ítems (Bulk Upload - Items)
// ==================================================
// Estructuras utilizadas en el proceso de carga masiva de ítems al sistema,
// incluyendo detalles de validación, procesamiento, resultados y errores.

export interface BulkUploadErrorMod {
  rowNumber: number;          // Número de fila en el archivo origen donde ocurrió el error
  errorMessage: string;       // Descripción del error encontrado
  field: string;              // Campo relacionado con el error
  rawData: string;            // Datos originales de la fila para referencia
}

// Respuesta generada tras la validación inicial del archivo cargado
export interface ValidationResponseMod {
  success: boolean;
  message: string;
  data: {
    totalRows: number;               // Total de filas procesadas
    successful: number;              // Total de filas válidas
    failed: number;                  // Total de filas con errores
    validRows: number;               // Total de filas listas para procesamiento
    errors: BulkUploadErrorMod[];    // Lista detallada de errores encontrados
    processingTime: string;          // Tiempo total del proceso de validación
  };
}

// Respuesta generada tras el procesamiento completo de los ítems
export interface ProcessResponseMod {
  success: boolean;
  message: string;
  data: {
    totalRows: number;                // Total de filas procesadas
    successful: number;               // Total de ítems creados exitosamente
    failed: number;                   // Total de ítems con errores
    generatedCodes: number;           // Total de códigos QR generados
    processedItems: ProcessedItemMod[]; // Lista detallada de ítems procesados
    errors: BulkUploadErrorMod[];     // Errores encontrados durante el proceso
    processingTime: string;           // Tiempo total de procesamiento
  };
}

// Detalles individuales de cada ítem procesado
export interface ProcessedItemMod {
  itemId: number;
  code: string;
  name: string;
  qrPath: string | null;
  success: boolean;
  errorMessage: string | null;
  codeGenerated: boolean;
}

// Estructura de la solicitud de carga masiva
export interface BulkUploadRequestMod {
  file: File;           // Archivo cargado (Excel, CSV, etc.)
  zoneId: number;       // Zona asociada a la carga
  fileType?: string;    // Tipo de archivo (opcional)
}
