// ==================================================
// Modelo: ModuleMod
// ==================================================
// Representa un módulo funcional dentro del sistema, incluyendo su nombre,
// descripción y estado de actividad.

export interface ModuleMod {
  id: number;
  name: string;
  description: string;
  active: boolean;
}
