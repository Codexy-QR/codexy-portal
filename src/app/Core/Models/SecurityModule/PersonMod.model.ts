// ==================================================
// Modelos: Personas registradas en el sistema
// ==================================================
// Contiene la estructura base para representar a una persona, así como
// un modelo simplificado con datos mínimos disponibles.

export interface PersonMod {
  id: number;
  name: string;
  lastName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  active: boolean;
  lastLogin?: Date;
}

export interface PersonAvailableMod {
  id: number;
  name: string;
}
