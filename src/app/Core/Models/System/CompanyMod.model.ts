// ==================================================
// Modelos: Compañías (Company)
// ==================================================
// Estructuras que representan a las empresas dentro del sistema, sus datos
// principales y las opciones de actualización parcial.

export interface CompanyOptionsMod {
	name: string;
	businessName: string;
	nit: string;
	industryId: number;
	email: string;
	website?: string;
	userId: number;
}

export interface CompanyMod {
	id: number;
	name: string;
	businessName: string;
	nit: string;
	industryId: string;
	industryName: string;
	email: string;
	website?: string;
	userId: number;
	active?: boolean;
}

export interface CompanyPartialUpdateMod {
	id: number;
	email?: string;
	website?: string;
}
