// ==================================================
// Modelos: Usuario del sistema
// ==================================================
// Estructuras principales para representar usuarios, incluyendo
// opciones simplificadas, actualizaciones parciales y relación con compañías.

export interface UserMod {
  id: number;
  username: string;
  password: string;
  active: boolean;
  personId: number;
  personName: string;
}

export interface UserOptionsMod {
  id: number;
  username: string;
  password?: string;
  active: boolean;
  personId: number;
}

export interface UserPartialUpdateMod {
  id: number;
  username?: string;
	name?: string;
	lastName?: string;
  email?: string;
  phone?: string;
}

export interface UserHasCompanyMod {
  hasCompany: boolean;
  companyId: number | null;
}
