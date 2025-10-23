// ==================================================
// Modelos: Relación Formulario - Módulo
// ==================================================
// Define la relación entre formularios y módulos dentro del sistema,
// además de sus opciones configurables.

export interface FormModuleMod {
  id: number;
  active: boolean;
  formId: number;
  formName: string;
  moduleId: number;
  moduleName: string;
}

export interface FormModuleOptionsMod {
  id: number;
  active: boolean;
  formId: number;
  moduleId: number;
}
