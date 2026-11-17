# Plan Backend — Proyecto Integrador (Web 1)

> El backend es el intermediario y verificador entre el frontend y la base de datos; el frontend **nunca** se conecta directo a la BD.

## Diagrama del flujo

```
Frontend (Angular, :4200)  --HTTP/JSON-->  Backend (Express + TS, :3000)  --SQL-->  PostgreSQL (Docker, :5432)
```

Cuando hablamos de **APIs** nos referimos a los endpoints HTTP que expone el backend. **JSON** es el formato en el que viaja la información: el backend serializa sus objetos a JSON y el `HttpClient` del frontend deserializa ese JSON a objetos TypeScript tipados con las interfaces de `src/app/interfaces`.

## Traducción página → endpoint

| Página | Funcionalidad | Endpoint | Módulo |
| --- | --- | --- | --- |
| Login | Iniciar sesión | `POST /api/auth/login` | auth |
| Register | Registrar cliente | `POST /api/auth/register` | auth |
| Client Events | Ver eventos | `GET /api/events` (+ `GET /api/events/:id`) | events |
| Create Reservation | Reservar cupos | `POST /api/reservations` | reservations |
| Client Reservations | Ver/cancelar reservas propias | `GET /api/reservations` + `PUT /api/reservations/:id` | reservations |
| Agent Create Event | Crear/editar eventos propios | `POST /api/events` + `PUT /api/events/:id` | events |
| Agent Reservations | Ver y actualizar reservas de sus eventos | `GET /api/reservations` + `PATCH /api/reservations/:id/estado` | reservations |
| Admin Reports | Reportes protegidos para ADMIN | `GET /api/admin/reports` | reports |
| Admin Accounts | CRUD de cuentas por rol | `/api/personas`, `/api/clientes`, `/api/agentes`, `/api/administradores` | person/client/agent/admin |
| Admin Locations | CRUD de ubicación | `/api/countries`, `/api/departments`, `/api/cities` | countries/departments/cities |

## Qué debe tener el backend para que exista cada funcionalidad

La cadena técnica que hace posible cada endpoint, en orden:

1. **Tablas en `init.sql`**: `persona`, `cliente`, `agente`, `admin`, `evento`, `reserva` y catálogos de ubicación/estados, con llaves y restricciones.
2. **Conexión en `config/database.ts`**: se leen las credenciales desde `.env` para conectar con PostgreSQL.
3. **Rutas en `modules/*/*.routes.ts`**: cada módulo declara sus endpoints y los asocia a un controller.
4. **Controller**: recibe la petición, valida los datos de entrada y construye la respuesta.
5. **Service**: contiene la lógica de negocio (control de cupos, cambio de estados, validación de permisos).
6. **Respuesta JSON**: el controller devuelve los datos en JSON y el frontend los consume con `HttpClient`.

## Estructura base a copiar del profesor

```
Backend/
├── docker-compose.yml
├── .env
├── package.json
├── tsconfig.json
└── src/
    ├── app.ts
    ├── config/
    │   ├── database.ts
    │   ├── envs.ts
    │   ├── swagger.ts
    │   └── swagger.schemas.ts
    ├── database/
    │   ├── init.sql
    │   ├── migrate-legacy.sql
    │   └── seed.sql
    ├── domain/
    │   ├── interfaces/
    │   └── errors/
    ├── presentation/
    │   ├── server.ts
    │   ├── routes.ts
    │   └── modules/
    │       └── example/
    └── scripts/
        ├── init-db.ts
        └── seed-db.ts
```

> Los módulos reales separan rutas, controladores, servicios y modelos. `example` se conserva como referencia.

> Para el manejo de variables de entorno se debe usar un archivo `.env.example` versionado junto con un `.gitignore` que excluya el `.env` real. El profesor commitea su `.env`; no repetir esa práctica para no exponer credenciales.

## Estado actual

- [x] Frontend Angular consume servicios HTTP para autenticación, eventos, reservas, cuentas, ubicación y reportes.
- [x] Backend organizado por módulos y capas; endpoints de autenticación, cuentas, eventos, reservas, ubicación y reportes.
- [x] Autorización por JWT/rol y alcance de reservas por el usuario autenticado.
- [x] Inicialización transaccional y migración del esquema anterior sin vaciar el volumen.
- [x] Pruebas de eventos, reservas y frontend; las pruebas de reservas requieren PostgreSQL.
- [x] PostgreSQL se levanta con Docker Compose. Ejecutar `npm run db:init` antes de iniciar la API.

Las semillas de prueba se cargan solo sobre una base vacía (`npm run db:seed`).
El archivo `.env` local debe tener un `JWT_SECRET` generado localmente y no se
debe versionar.
