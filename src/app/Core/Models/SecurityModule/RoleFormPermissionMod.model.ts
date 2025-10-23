// ==================================================
// Modelos: Relación Rol - Formulario - Permiso
// ==================================================
// Estructuras que representan las combinaciones de roles, formularios y permisos,
// incluyendo opciones simplificadas para configuración.

export interface RoleFormPermissionMod {
	id: number;
	active: boolean;
	roleId: number;
	roleName: string;
	formId: number;
	formName: string;
	permissionId: number;
	permissionName: string;
}

export interface RoleFormPermissionOptionsMod {
	id: number;
	active: boolean;
	roleId: number;
	formId: number;
	permissionId: number;
}
