# Backend — Proyecto Integrador

API REST base construida con Express y TypeScript. Es el intermediario entre el
frontend Angular y PostgreSQL: valida las peticiones, aplica la lógica de negocio
y devuelve JSON. El frontend nunca se conecta directo a la base de datos.

## Cómo levantarlo

1. Copiar las variables de entorno: copia `.env.example` como `.env`, ajusta la base y genera un `JWT_SECRET` largo y local.
2. Levantar PostgreSQL y pgAdmin con Docker: `docker compose up -d`.
3. Instalar dependencias: `npm install`.
4. Iniciar el servidor en modo desarrollo: `npm run dev` (o `npm start`).

El servidor queda disponible en `http://localhost:3000`.

## Base de datos

- Crear las tablas: `npm run db:init` (ejecuta `src/database/init.sql`).
- Cargar datos de prueba: `npm run db:seed` (ejecuta `src/database/seed.sql`).
  El seed transforma las claves de ejemplo en hashes bcrypt mediante `pgcrypto`.

Los módulos están en `src/presentation/modules` y separan Models, Services,
Controllers y Routes.

## APIs disponibles

- `POST /api/auth/login`: recibe `{ "email": "...", "password": "..." }`.
- `POST /api/auth/register`: crea un CLIENTE y su perfil en una transacción. Recibe `identificacion`, `nombre`, `direccion`, `email`, `password` e `id_ciudad`.
- Login y registro devuelven `{ user, token }`; nunca devuelven `clave`.
- `/api/personas`, `/api/clientes`, `/api/agentes` y `/api/administradores` tienen `GET`, `GET /:id`, `POST`, `PUT /:id` y `DELETE /:id`; requieren JWT y rol ADMIN.
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
- `GET /api/events` y `GET /api/events/:id`: requieren autenticación. CLIENTE
  consulta todos los eventos; AGENTE recibe y consulta únicamente los propios.
- `POST /api/events`: requiere token AGENTE; la identificación del agente se toma
  del token, nunca del frontend. Recibe `id_ciudad`, `nombre`, `teatro`,
  `capacidad`, `descripcion`, `precio`, `fecha_inicio` y `fecha_fin`.
  `estado` es opcional y por defecto es `PROGRAMADO`.
- `PUT /api/events/:id`: requiere token AGENTE y solo permite actualizar un evento
  propio; recibe los mismos campos que la creación.
- `DELETE /api/events/:id`: requiere token AGENTE y solo permite borrar eventos
  propios. Devuelve `409 Conflict` si existe cualquier reserva asociada: el evento
  debe conservarse para proteger su historial y evitar el borrado en cascada.
- `GET /api/reservations` y `GET /api/reservations?cliente=3001`: consulta reservas.
- `POST /api/reservations`: requiere token CLIENTE; `identificacion` se toma del token. Recibe `id_evento`,
  `entradas` y, opcionalmente, `observacion`.
- `PATCH /api/reservations/:id/estado`: recibe `{ "estado": "CONFIRMADA" }`.

Todos los GET de eventos y reservas requieren autenticación; los cambios de
estado requieren AGENTE o ADMIN. Los eventos se devuelven con los campos que
consume Angular (`codigo`, `identificacion`, `id_ciudad`, `observaciones` y
estados legibles). Las fechas de evento son fechas calendario (`YYYY-MM-DD`),
conforme al tipo `DATE` del esquema.

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
La gestión de cuentas y reportes ya está integrada en el contenedor
administrativo; la gestión de ubicaciones conserva su componente existente.
