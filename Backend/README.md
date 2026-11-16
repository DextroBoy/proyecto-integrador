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

Los módulos están en `src/presentation/modules` y separan Models, Services,
Controllers y Routes.

## APIs disponibles

- `POST /api/auth/login`: recibe `{ "email": "...", "password": "..." }`.
- `GET /api/countries` y `GET /api/countries/:id`: consulta países.
- `POST /api/countries`: recibe `{ "nombre": "Colombia" }`.
- `PUT /api/countries/:id`: actualiza el nombre de un país.
- `DELETE /api/countries/:id`: elimina un país que no tenga departamentos.
- `GET /api/departments?paisId=1`: consulta departamentos; el filtro es opcional.
- `GET /api/departments/:id`, `POST /api/departments`,
  `PUT /api/departments/:id` y `DELETE /api/departments/:id`.
- `GET /api/cities?departamentoId=1`: consulta ciudades; el filtro es opcional.
- `GET /api/cities/:id`, `POST /api/cities`, `PUT /api/cities/:id` y
  `DELETE /api/cities/:id`.
- `GET /api/admin/reports?year=2026`: consulta los resúmenes y reportes
  disponibles para el año indicado; si se omite, usa el año actual.
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

Los endpoints de ubicación devuelven objetos con los nombres de las columnas de
la base (`id`, `nombre`, `id_pais` e `id_departamento`). El borrado de una
ubicación devuelve `409 Conflict` si existen registros dependientes, para evitar
que el `ON DELETE CASCADE` del esquema elimine personas, eventos o ubicaciones
asociadas.

El reporte mensual de ingresos incluye reservas confirmadas y se agrupa por la
fecha de reserva. Los promedios de agente y cliente se calculan sobre el total de
las reservas confirmadas del año consultado. Las causas de cancelación usan el
campo `observacion`, que es el campo disponible en el esquema.

Los servicios Angular de ubicación y reportes usan `http://localhost:3000/api`
por defecto. La URL se puede reemplazar con el token `API_BASE_URL`. Los
componentes nuevos todavía deben integrarse en las rutas y el contenedor
administrativo de Angular.
