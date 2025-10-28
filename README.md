<div align="center">

🖥️ Codexy Portal (Frontend)

Este es el repositorio oficial del Portal de Administración (Frontend) de la aplicación Codexy App, construido con Angular.

</div>

<div align="center">

</div>

🧭 Tabla de Contenidos

Descripción del Proyecto

Características Principales

Pila Tecnológica

🚀 Cómo Empezar (Instalación)

📜 Scripts Disponibles

📁 Estructura de Carpetas

🔗 Conexión al Backend

👥 Roles de Usuario (Portal Web)

🧑‍💻 Equipo de Desarrollo

Repositorios del Ecosistema

📝 1. Descripción del Proyecto

Este repositorio contiene el código fuente del portal de administración (Frontend) de Codexy App. Esta aplicación web permite a los administradores y gerentes gestionar todos los aspectos del sistema de inventario, desde la creación de usuarios y sucursales hasta la aprobación de conteos y la generación de reportes.

✨ 2. Características Principales

Gestión de Usuarios y Roles: Creación, edición y asignación de permisos.

Administración de Estructura: CRUD para Compañía, Sucursales y Zonas.

Gestión de Catálogo: CRUD para los artículos del inventario.

Asignación de Tareas: Creación de tareas de inventario para los operarios móviles.

Aprobación de Conteos: Revisión y aprobación de los inventarios realizados por los operarios.

Dashboard y Reportes: Visualización de datos clave del inventario.

🛠️ 3. Pila Tecnológica

Tecnología

Propósito

Angular

Framework principal para la SPA.

TypeScript

Lenguaje de programación.

Tailwind CSS

Framework de CSS para estilos.

RxJS

Programación reactiva y manejo de estado.

Angular Material

Componentes de UI (si se utiliza).

🚀 4. Cómo Empezar (Instalación)

Sigue estos pasos para levantar el entorno de desarrollo local.

Prerrequisitos

Node.js (v18+ recomendado)

Angular CLI (npm install -g @angular/cli)

Pasos de Instalación

Clonar el repositorio:

git clone [https://github.com/Codexy-QR/codexy-portal.git](https://github.com/Codexy-QR/codexy-portal.git)


Navegar al directorio:

cd codexy-portal


Instalar dependencias:

npm install


Configurar el Entorno:

Crea un archivo src/environments/environment.ts (basado en environment.example.ts si existe).

Asegúrate de configurar la URL de la API del backend (codexy-api):

<!-- end list -->

export const environment = {
  production: false,
  apiUrl: 'http://localhost:7000/api' // URL de tu backend local
};


Ejecutar la aplicación:

ng serve -o


La aplicación se abrirá automáticamente en http://localhost:4200/.

📜 5. Scripts Disponibles

Dentro del package.json, encontrarás los siguientes scripts:

npm start: Ejecuta ng serve. Levanta el servidor de desarrollo.

npm run build: Compila la aplicación para producción en la carpeta /dist.

npm run test: Ejecuta las pruebas unitarias con Karma/Jasmine.

npm run lint: Analiza el código en busca de errores de estilo.

📁 6. Estructura de Carpetas

La estructura principal del código fuente se encuentra en la carpeta src y src/app:

src/
├── app/
│   ├── Components/  (Componentes compartidos, ej: layout, botones, modales)
│   ├── Core/        (Servicios core, guards, interceptors)
│   ├── Views/       (Páginas/Módulos principales, ej: login, dashboard)
│   │
│   ├── app.component.ts
│   ├── app.config.ts  (Configuración de la app - Standalone)
│   └── app.routes.ts  (Rutas principales)
│
├── environments/    (Archivos de entorno .dev y .prod)
├── index.html
├── main.ts
└── styles.css


🔗 7. Conexión al Backend

Este portal consume la API REST codexy-api. Para un funcionamiento completo en desarrollo local, el servidor del backend debe estar ejecutándose y la URL debe estar correctamente configurada en el archivo de entorno.

[ 💻 Angular Portal (Este Repo) ]
             |
             v
[ 🌐 API REST (codexy-api) ]
             |
             v
[ 🗃️ Base de Datos (codexy-db) ]


👥 8. Roles de Usuario (Portal Web)

Este portal gestiona los siguientes roles administrativos:

👑 Super Admin / Administrador: Control total del sistema.

🥈 Subadmin: Permisos administrativos delegados.

🏦 Gerente de Sucursal: Administra su sucursal, zonas y tareas.

🗺️ Encargado de Zona (Jefe de Zona): Revisa y aprueba conteos.

🧑‍💻 9. Equipo de Desarrollo

Nombre

Rol

Contacto (GitHub / LinkedIn)

Juan Manuel Gutierrez Fierro

Líder / Dev. Backend y Frontend

[@juan-gutierrez]

Rubén Felipe Tovar

Coordinador / Dev. Backend y Frontend

[@ruben-tovar]

Isabella Carrera Cabrera

Monitora / Dev. Frontend

[@isabella-carrera]

📂 10. Repositorios del Ecosistema

📦 codexy-api: Repositorio del Backend (API en C# .NET).

🖥️ codexy-portal: (Este Repositorio) Frontend (Portal Web en Angular).

📱 codexy-app: Repositorio de la Aplicación Móvil (Ionic).

🗃️ codexy-db: Scripts y modelo de Base de Datos (SQL Server).

📖 codexy-docs: Documentación central del proyecto.