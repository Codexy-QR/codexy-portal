<div align="center">

# 🖥 Codexy Portal (Frontend)

*Repositorio oficial del Portal de Administración (Frontend)* de la aplicación *Codexy App, construido con **Angular*.

</div>

---

## 🧭 Tabla de Contenidos
- [Descripción del Proyecto](#-1-descripción-del-proyecto)
- [Características Principales](#-2-características-principales)
- [Pila Tecnológica](#-3-pila-tecnológica)
- [Cómo Empezar (Instalación)](#-4-cómo-empezar-instalación)
- [Scripts Disponibles](#-5-scripts-disponibles)
- [Estructura de Carpetas](#-6-estructura-de-carpetas)
- [Conexión al Backend](#-7-conexión-al-backend)
- [Roles de Usuario (Portal Web)](#-8-roles-de-usuario-portal-web)
- [Equipo de Desarrollo](#-9-equipo-de-desarrollo)
- [Repositorios del Ecosistema](#-10-repositorios-del-ecosistema)

---

## 📝 1. Descripción del Proyecto

Este repositorio contiene el código fuente del *portal de administración (Frontend)* de *Codexy App*.  
La aplicación web permite a los administradores y gerentes gestionar todos los aspectos del sistema de inventario: creación de usuarios, sucursales, aprobación de conteos y generación de reportes.

---

## ✨ 2. Características Principales

- *Gestión de Usuarios y Roles:* creación, edición y asignación de permisos.  
- *Administración de Estructura:* CRUD para Compañía, Sucursales y Zonas.  
- *Gestión de Catálogo:* CRUD para artículos del inventario.  
- *Asignación de Tareas:* creación de tareas para los operarios móviles.  
- *Aprobación de Conteos:* revisión y aprobación de inventarios.  
- *Dashboard y Reportes:* visualización de métricas clave.

---

## 🛠 3. Pila Tecnológica

| Tecnología       | Propósito                                   |
|------------------|---------------------------------------------|
| *Angular*      | Framework principal para la SPA.            |
| *TypeScript*   | Lenguaje de programación.                   |
| *Tailwind CSS* | Framework de estilos CSS.                   |
| *RxJS*         | Programación reactiva y manejo de estado.   |
| *Angular Material* | Componentes de UI (opcional).          |

---

## 🚀 4. Cómo Empezar (Instalación)

### Prerrequisitos
- Node.js (v18+ recomendado)  
- Angular CLI (npm install -g @angular/cli)

### Pasos de Instalación

1. *Clonar el repositorio*
   ```bash
   git clone https://github.com/Codexy-QR/codexy-portal.git
Navegar al directorio

bash
Copiar código
cd codexy-portal
Instalar dependencias

bash
Copiar código
npm install
Configurar el entorno
Crea src/environments/environment.ts (basado en environment.example.ts si existe):

ts
Copiar código
export const environment = {
  production: false,
  apiUrl: 'http://localhost:7000/api' // URL de tu backend local
};
Ejecutar la aplicación

bash
Copiar código
ng serve -o
La aplicación se abrirá en http://localhost:4200.

📜 5. Scripts Disponibles
Script	Descripción
npm start	Ejecuta ng serve (modo desarrollo).
npm run build	Compila para producción en /dist.
npm run test	Ejecuta pruebas unitarias con Karma/Jasmine.
npm run lint	Analiza el código y estilo.

📁 6. Estructura de Carpetas
java
Copiar código
src/
├── app/
│   ├── Components/  → Componentes compartidos (layout, botones, modales)
│   ├── Core/        → Servicios core, guards, interceptors
│   ├── Views/       → Páginas/Módulos principales (login, dashboard)
│   ├── app.component.ts
│   ├── app.config.ts  → Configuración de la app (Standalone)
│   └── app.routes.ts  → Rutas principales
│
├── environments/    → Archivos de entorno (.dev y .prod)
├── index.html
├── main.ts
└── styles.css
🔗 7. Conexión al Backend
El portal consume la API REST codexy-api.
Para desarrollo local, el backend debe estar corriendo y configurado correctamente en el archivo de entorno.

java
Copiar código
[ 💻 Angular Portal (Este Repo) ]
             |
             v
[ 🌐 API REST (codexy-api) ]
             |
             v
[ 🗃 Base de Datos (codexy-db) ]
👥 8. Roles de Usuario (Portal Web)
👑 Super Admin / Administrador: control total del sistema.

🥈 Subadmin: permisos administrativos delegados.

🏦 Gerente de Sucursal: administra su sucursal, zonas y tareas.

🗺 Encargado de Zona: revisa y aprueba conteos.

🧑‍💻 9. Equipo de Desarrollo
Nombre	Rol	Contacto
Juan Manuel Gutiérrez Fierro	Líder / Dev. Backend y Frontend	[@juan-gutierrez]
Rubén Felipe Tovar	Coordinador / Dev. Backend y Frontend	[@ruben-tovar]
Isabella Carrera Cabrera	Monitora / Dev. Frontend	[@isabella-carrera]

📂 10. Repositorios del Ecosistema
Repositorio	Descripción
📦 codexy-api	Backend (API en C# .NET).
🖥 codexy-portal	Este repositorio. Frontend (Portal Web en Angular).
📱 codexy-app	Aplicación Móvil (Ionic).
🗃 codexy-db	Scripts y modelo de base de datos (SQL Server).
📖 codexy-docs	Documentación central del proyecto.