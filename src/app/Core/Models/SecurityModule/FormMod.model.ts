// ==================================================
// Modelo: FormMod
// ==================================================
// Representa un formulario dentro del sistema, incluyendo su identificación,
// nombre, descripción y estado de actividad.

export interface FormMod {
  id: number;
  name: string;
  description: string;
  active: boolean;
}
