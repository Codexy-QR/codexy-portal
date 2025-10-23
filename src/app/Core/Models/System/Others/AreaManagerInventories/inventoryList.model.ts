// ==================================================
// Modelos: Resumen de inventarios (InventorySummaryResponse)
// ==================================================
// Representa un resumen global de los inventarios asociados a una zona,
// incluyendo el total, el último inventario realizado y la lista de registros.

export interface InventoryListItem {
  id: number;                                   // ID del inventario
  date: string;                                 // Fecha en que se realizó
  operatingGroup: {
    id: number;
    name: string;
    operativesCount: number;                    // Número de operativos asignados (calculado en backend)
  };
  itemsCount: number;                           // Número total de ítems en el inventario
  itemsVariety: number;                         // Número de tipos distintos de ítems
  verificationResult: boolean;                  // Resultado de la verificación final
}

export interface InventorySummaryResponse {
  totalInventories: number;                     // Total de inventarios realizados
  lastInventory: InventoryListItem | null;      // Último inventario registrado
  inventories: InventoryListItem[];            // Lista de inventarios realizados
}
