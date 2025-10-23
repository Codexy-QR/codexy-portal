// ==================================================
// Modelos: Sucurusales (Branch)
// ==================================================
// Estructuras de datos relacionadas con las sedes del sistema, incluyendo
// información básica, detalles completos, responsables y actualizaciones parciales.

export interface BranchOptionsMod {
  name: string;
  adress: string;
  phone: string;
  userId: number;
  compnayId: number;
}

export interface BranchMod {
  id: number;
  name: string;
  adress: string;
  phone: string;
  inChargeId: number;
  inChargeName: string;
  companyId: number;
  companyName: string;
}

export interface BranchByCompanyMod {
  id: number;
  name: string;
}

export interface BranchDetailsMod {
  id: number;
  name: string;
  address: string;
  phone: string;
  inventoriesCount: number;
  zonesCount: number;
  zones: Array<{
    id: number;
    name: string;
    inChargeFullName: string;
    itemsCount: number;
  }>;
}

export interface BranchInChargeMod {
  inChargeFullName: string;
  inChargePhone: string;
  inChargeEmail: string;
}

export interface BranchInChargesMod {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  branchName: string;
}

export interface BranchPartialUpdateMod {
  id: number;
  phone?: string;
}
