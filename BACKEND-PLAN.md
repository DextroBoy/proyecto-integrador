# Plan Backend — Proyecto Integrador (Web 1)

> El backend es el intermediario y verificador entre el frontend y la base de datos; el frontend **nunca** se conecta directo a la BD.

## Diagrama del flujo

```
Frontend (Angular, :4200)  --HTTP/JSON-->  Backend (Express + TS, :3000)  --SQL-->  PostgreSQL (Docker, :5432)
```

Cuando hablamos de **APIs** nos referimos a los endpoints HTTP que expone el backend. **JSON** es el formato en el que viaja la información: el backend serializa sus objetos a JSON y el `HttpClient` del frontend deserializa ese JSON a objetos TypeScript tipados con las interfaces de `src/app/interfaces`.

## Traducción página → endpoint

| Página | Funcionalidad | Endpoint | Módulo a crear |
| --- | --- | --- | --- |
| Login | Iniciar sesión | `POST /api/auth/login` | auth |
| Register | Registrar usuario | `POST /api/auth/register` | auth |
| Client Events | Ver todos los eventos | `GET /api/events` (+ `GET /api/events/:id`) | events |
| Create Reservation | Realizar reserva | `POST /api/reservations` | reservations |
| Client Reservations | Ver mis reservas con estado | `GET /api/reservations?cliente=X` | reservations |
| Agent Create Event | Registrar evento | `POST /api/events` | events |
| Agent Events | Ver eventos registrados | `GET /api/events` | events |
| Agent Reservations | Ver reservas y actualizar estado | `GET /api/reservations` + `PATCH /api/reservations/:id/estado` | reservations |
| Admin Reports | Reportes (gráficas/tablas) | `GET /api/admin/reports` | reports |

## Qué debe tener el backend para que exista cada funcionalidad

La cadena técnica que hace posible cada endpoint, en orden:

1. **Tablas en `init.sql`**: `users`, `events` y `reservations`, con sus llaves primarias, foráneas y restricciones.
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

> El módulo `example` es la plantilla de referencia. Los módulos reales (`auth`, `events`, `reservations`, `reports`) los construye el estudiante copiando ese mismo patrón (rutas → controller → service).

> Para el manejo de variables de entorno se debe usar un archivo `.env.example` versionado junto con un `.gitignore` que excluya el `.env` real. El profesor commitea su `.env`; no repetir esa práctica para no exponer credenciales.

## Orden de integración sugerido

1. **events** — es la entidad central: sin eventos no hay reservas, y los reportes dependen de ambos.
2. **auth** — aporta usuarios y sesión, necesarios para asociar reservas a un cliente.
3. **reservations** — depende de que existan eventos y usuarios.
4. **reports** — agrega y resume información de eventos y reservas ya existentes.

## Estado actual

- [x] Frontend reestructurado (interfaces y components en `src/app`, master merged).
- [ ] Servicios del front creados con mocks (`event.service.ts` y `reservation.service.ts` siguen sueltos en `src/app/services`, pendiente reorganizarlos por perfil).
- [x] Carpeta `Frontend/` del monorepo.
- [x] Carpeta `Backend/` base (copiada del profesor, con `.env.example` y `.gitignore` propios).
- [ ] `docker-compose` levantando PostgreSQL.
- [ ] Módulos reales del backend.
