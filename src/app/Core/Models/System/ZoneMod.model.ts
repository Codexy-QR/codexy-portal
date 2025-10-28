// ==================================================
// Modelos: Zonas (Zone)
// ==================================================
// Estructuras que representan las zonas dentro del sistema, sus detalles,
// elementos asociados y actualizaciones parciales.

export interface ZoneOptionsMod {
  name: string;
  description: string;
  stateZone: number;
  branchId: number;
  userId: string;
}

export interface ZoneMod {
  id: number;
  name: string;
  description: string;
  stateZone: string;
  branchId: string;
  branchName: string;
  inChargeId: string;
  inChargeName: string;
}

export interface ZoneByBranchMod {
  id: number;
  name: string;
}

export interface ZoneDetailsMod {
  id: number;
  name: string;
  description: string;
  state: string;
  inChargeUserId: number;
  inChargeFullName: string;
  inChargeEmail: string;
  inChargePhone: string;
  inventoriesCount: number;
  itemsCount: number;
  items: ZoneItemMod[];
}

export interface ZoneDetailsApi {
  id: number;
  name: string;
  description: string;
  state: string;
  inChargeUserId: number;
  inChargeFullName: string;
  inChargeEmail: string;
  inChargePhone: string;
  inventoriesCount: number;
  itemsCount: number;
  items: ZoneItemApi[];
}

export interface ZoneItemMod {
  itemId: number;
  code: string;
  name: string;
  description: string;
  category: string;
  state: string;
}

export interface ZoneItemApi {
  itemId: number;
  code: string;
  name: string;
  description: string;
  categoryId: number;
  stateId: number;
}

export interface ZoneInChargesMod {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  zoneName: string;
}

export interface ZonePartialUpdateMod {
  id: number;
  name?: string;
  description?: string;
}
