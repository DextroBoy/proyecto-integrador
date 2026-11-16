# Backend — Proyecto Integrador

API REST base construida con Express y TypeScript. Es el intermediario entre el
frontend Angular y PostgreSQL: valida las peticiones, aplica la lógica de negocio
y devuelve JSON. El frontend nunca se conecta directo a la base de datos.

## Cómo levantarlo

1. Copiar las variables de entorno: copia `.env.example` como `.env` y ajusta los valores.
2. Levantar PostgreSQL y pgAdmin con Docker: `docker compose up -d`.
3. Instalar dependencias: `npm install`.
4. Iniciar el servidor en modo desarrollo: `npm run dev` (o `npm start`).

El servidor queda disponible en `http://localhost:3000`.

## Base de datos

- Crear las tablas: `npm run db:init` (ejecuta `src/database/init.sql`).
- Cargar datos de prueba: `npm run db:seed` (ejecuta `src/database/seed.sql`).

El módulo `src/presentation/modules/example` es la plantilla para crear los módulos
reales (`auth`, `events`, `reservations`, `reports`). El plan completo, el flujo y la
traducción página → endpoint están en [`../BACKEND-PLAN.md`](../BACKEND-PLAN.md).

## APIs disponibles

- `POST /api/auth/login`: recibe `{ "email": "...", "password": "..." }`.
- `GET /api/events` y `GET /api/events/:id`: consulta eventos.
- `POST /api/events`: crea un evento; requiere `identificacion` (agente),
  `id_ciudad`, `nombre`, `teatro`, `capacidad`, `descripcion`, `precio`,
  `fecha_inicio` y `fecha_fin`. `estado` es opcional y por defecto es `PROGRAMADO`.
- `GET /api/reservations` y `GET /api/reservations/:id`: consulta reservas dentro
  del alcance del usuario autenticado (cliente o eventos del agente).
- `POST /api/reservations`: recibe `id_evento`, `entradas` y, opcionalmente,
  `observacion`. La identidad del cliente procede de `req.user`, no del cuerpo.
- `PUT /api/reservations/:id`: actualiza entradas/evento/observaciones del cliente
  autenticado o el estado de reservas de los eventos del agente.
- `PATCH /api/reservations/:id/estado`: compatibilidad para actualizar el estado.
- `DELETE /api/reservations/:id`: elimina una reserva dentro del alcance autorizado.

Las pruebas de integración de reservas usan los datos de PostgreSQL y se ejecutan
con `npm run test:reservations`. El módulo espera que el middleware de autenticación
adjunte `{ identificacion, rol }` a `req.user`; actualmente el módulo de autenticación
del proyecto solo expone login y aún no registra ese middleware.

Los eventos y reservas se devuelven con los campos que consume el frontend
(`codigo`, `observaciones`, estados legibles y, en las reservas, `evento`).
