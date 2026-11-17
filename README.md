# Proyecto Integrador

Aplicación para gestionar eventos y reservas con Angular, una API REST en
Node.js/Express y PostgreSQL. El frontend consume la API; no se conecta
directamente a la base de datos.

## Requisitos

- Node.js compatible con Angular 20 y npm.
- Docker Desktop.

## Instalación y ejecución

### Backend y base de datos

Desde PowerShell, en la raíz del proyecto:

```powershell
cd Backend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm install
docker compose up -d
npm run db:init
npm run db:seed
npm run dev
```

En `Backend/.env`, reemplaza el marcador de `JWT_SECRET` por una clave aleatoria
generada localmente. Desde PowerShell, dentro de `Backend`, puedes generarla así:

```powershell
$bytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Copia el texto que imprime PowerShell después de `JWT_SECRET=` en `Backend/.env`.
Cada instalación puede usar una clave distinta; conserva la misma entre
reinicios para no invalidar las sesiones activas. No publiques ni agregues el
archivo `.env` al repositorio. No vuelvas a ejecutar `db:seed` sobre una base que
ya tenga datos. `db:init` migra el esquema anterior y conserva sus registros
dentro de una transacción.

La API queda en `http://localhost:3000` y Swagger en
`http://localhost:3000/api/docs`.

### Frontend

En una segunda terminal:

```powershell
cd Frontend
npm install
npm start
```

Abre `http://localhost:4200/`. La URL de la API por defecto es
`http://localhost:3000/api`.

## Funcionalidades

| Ruta | Funcionalidad |
| --- | --- |
| `/login` | Inicio de sesión conectado a PostgreSQL. |
| `/register` | Registro de clientes con ubicación real. |
| `/client/events` | Consulta eventos y permite iniciar reservas. |
| `/client/reservations` | Consulta y cancela las reservas del cliente. |
| `/client/create-reservation/:id` | Crea reservas con validación de cupos. |
| `/agent/events` | Consulta y administra los eventos del agente. |
| `/agent/create-event` | Crea o actualiza eventos. |
| `/agent/reservations` | Consulta, actualiza estados y elimina reservas de sus eventos. |
| `/admin` | Reportes, cuentas y administración de ubicación, protegido para ADMIN. |

Las operaciones de la API requieren autenticación y rol según el recurso. Los
eventos y reservas se asocian al usuario autenticado; el backend comprueba cupos
de forma transaccional y una reserva cancelada deja de ocupar capacidad.

Los datos visibles en las pantallas funcionales se cargan desde la API. Las
pruebas unitarias pueden usar datos simulados para aislar componentes; eso no
significa que la aplicación en ejecución use mocks. Las imágenes de eventos son
marcadores visuales y no forman parte del catálogo de la base de datos.

## Comprobaciones

Desde `Backend`: `npm run typecheck`, `npm test` y
`npm run test:reservations` (este último requiere PostgreSQL).

Desde `Frontend`: `npm run build` y `npm test -- --watch=false`.

Consulta [Backend/README.md](./Backend/README.md) para los endpoints, permisos y
detalles de la migración.

## Tecnologías

- Angular 20 y TypeScript.
- Node.js, Express y PostgreSQL.
- Bootstrap 5, Bootstrap Icons y SCSS.
