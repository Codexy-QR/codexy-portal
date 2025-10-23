// ==================================================
// Modelos: Detalle de inventario (InventoryDetailResponse)
// ==================================================
// Estructuras utilizadas para representar el detalle completo de un inventario
// individual, incluyendo el grupo operativo asignado, los ítems inspeccionados
// y un resumen de su estado actual.

export interface InventoryDetailResponse {
  id: number;                                 // ID del inventario
  date: string;                               // Fecha de realización
  observations: string | null;                // Observaciones generales
  zoneId: number;                             // ID de la zona relacionada
  operatingGroup: OperatingGroupDetail;       // Grupo operativo asignado
  inventaryDetails: InventoryDetailItem[];    // Detalle de ítems inspeccionados
  statusSummary: StatusSummary[];             // Resumen de estados
}

export interface OperatingGroupDetail {
  id: number;                // ID del grupo operativo
  name: string;              // Nombre del grupo
  dateStart: string;         // Fecha de inicio
  dateEnd: string | null;    // Fecha de finalización (si aplica)
  operatings: OperativeDetail[]; // Lista de operativos asignados
}

export interface OperativeDetail {
  id: number;     // ID del operativo
  user: {
    id: number;   // ID del usuario asociado
    name: string; // Nombre completo
    email: string;// Correo electrónico
  };
}

export interface InventoryDetailItem {
  id: number;     // ID del ítem dentro del inventario
  item: {
    id: number;
    code: string;
    name: string;
    description: string | null;
    categoryItem: {
      id: number;
      name: string;
    };
  };
  stateItem: {
    id: number;
    name: string;
  };
}

export interface StatusSummary {
  name: string;  // Nombre del estado (ej: "En orden", "Dañado")
  count: number; // Cantidad de ítems en ese estado
}
