// ==================================================
// Modelo: RoleMod
// ==================================================
// Representa un rol dentro del sistema, incluyendo su nombre,
// descripción y estado activo.

export interface RoleMod {
  id: number;
  name: string;
  description: string;
  active: boolean;
}
