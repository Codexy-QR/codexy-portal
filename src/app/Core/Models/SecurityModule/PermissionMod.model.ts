// ==================================================
// Modelo: PermissionMod
// ==================================================
// Define los permisos asociados al sistema, indicando su nombre,
// descripción y si están activos o no.

export interface PermissionMod {
  id: number;
  name: string;
  description: string;
  active: boolean;
}
