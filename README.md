# Proyecto Integrador

Aplicación web de gestión de eventos con frontend Angular, API REST en Node.js y
base de datos PostgreSQL. Las vistas de eventos y reservas existentes aún tienen
flujos demostrativos; los componentes de ubicación y reportes ya tienen servicios
y APIs, pero requieren integrarse al contenedor y las rutas globales de Angular.

## Requisitos

- Node.js compatible con Angular 20.
- npm.
- Docker Desktop para PostgreSQL local.

Las dependencias y versiones del frontend y backend se definen en sus respectivos
archivos `package.json` y `package-lock.json`.

## Instalación y ejecución

### Backend y base de datos

Desde PowerShell:

```powershell
cd Backend
Copy-Item .env.example .env
npm install
docker compose up -d
npm run db:init
npm run db:seed
npm run dev
```

La API queda disponible en `http://localhost:3000`; Swagger está en
`http://localhost:3000/api/docs`. Revisa `Backend/.env.example` antes de iniciar.

### Frontend

En una segunda terminal:

```powershell
cd Frontend
npm install
npm run start
```

Abre [http://localhost:4200/](http://localhost:4200/). La URL de la API por
defecto es `http://localhost:3000/api`.

## Rutas disponibles

| Ruta | Contenido |
| --- | --- |
| `/` | Redirección a `/login`. |
| `/login` | Formulario visual de inicio de sesión. |
| `/register` | Formulario visual de registro. |
| `/client` | Área de cliente; redirige a `/client/events`. |
| `/client/events` | Listado de eventos y enlaces para reservar; el flujo todavía conserva mocks. |
| `/client/reservations` | Listado de reservas; el flujo todavía conserva mocks. |
| `/client/create-reservation/:id` | Detalle de evento y formulario de reserva de demostración. |
| `/client/create-reservation` | Redirección a `/client/events`. |
| `/admin` | Panel administrativo que aún muestra reportes estáticos; el nuevo componente de reportes debe integrarse. |
| `/agent` | Área de agente; redirige a `/agent/events`. |
| `/agent/events` | Tabla estática de eventos registrados. |
| `/agent/create-event` | Formulario visual para registrar un evento. |
| `/agent/reservations` | Tabla estática para administrar reservas. |

Las rutas no tienen autenticación ni guards de acceso. Los componentes de
administración de ubicaciones y reportes todavía no están conectados desde
`app.routes.ts`.

## Datos mock y limitaciones

- Los eventos están definidos directamente en `EventService`: actualmente hay
  cinco eventos de ejemplo, con código, nombre, ubicación, fechas, capacidad,
  precio, observaciones y estado.
- Las reservas iniciales están definidas en `ReservationService`: hay tres
  reservas asociadas a esos eventos.
- Al confirmar una reserva desde
  `/client/create-reservation/:id`, se crea una reserva en memoria con un código
  consecutivo, el precio calculado y estado `Reservada`. La cantidad permitida
  es de 1 a 10 entradas.
- Los flujos de eventos y reservas que muestran esas páginas aún usan mocks:
  sus cambios solo viven mientras la aplicación está abierta y se restablecen al
  recargar. Aunque el backend y los nuevos servicios de ubicación/reportes
  existen, esas pantallas todavía no están conectadas a ellos.
- No hay pagos ni persistencia en el navegador.
- Los formularios de `/login` y `/register` no tienen lógica de autenticación o
  registro conectada.
- Las pantallas de `/admin` y `/agent` muestran contenido fijo. Sus formularios,
  selectores y botones no guardan eventos, actualizan reservas ni generan
  reportes dinámicamente.
- Las imágenes de eventos son marcadores visuales (`placehold.co`), no imágenes
  almacenadas del catálogo.

## Tecnologías principales

- Angular 20 con enrutamiento y renderizado del lado del servidor configurado.
- TypeScript.
- Bootstrap 5, Bootstrap Icons y estilos SCSS.
