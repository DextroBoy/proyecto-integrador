# Backend — Proyecto Integrador

API REST base construida con Express y TypeScript. Es el intermediario entre el
frontend Angular y PostgreSQL: valida las peticiones, aplica la lógica de negocio
y devuelve JSON. El frontend nunca se conecta directo a la base de datos.

## Cómo levantarlo

1. Si no existe `.env`, copiar `.env.example` como `.env`; conservar y editar el
   `.env` local existente. Ajustar la base y reemplazar el marcador de
   `JWT_SECRET` con una clave aleatoria generada localmente:

   ```powershell
   $bytes = New-Object byte[] 48
   $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
   $rng.GetBytes($bytes)
   [Convert]::ToBase64String($bytes)
   $rng.Dispose()
   ```

   Copiar el resultado después de `JWT_SECRET=`. Cada instalación puede usar una
   clave distinta; mantenerla igual entre reinicios para no invalidar las
   sesiones activas. No publicar ni agregar `.env` al repositorio.
2. Levantar PostgreSQL y pgAdmin con Docker: `docker compose up -d`.
3. Instalar dependencias: `npm install`.
4. Iniciar el servidor en modo desarrollo: `npm run dev` (o `npm start`).

El servidor queda disponible en `http://localhost:3000`.

## Base de datos

- Inicializar o actualizar el esquema: `npm run db:init`. La operación aplica
  `src/database/migrate-legacy.sql` y `src/database/init.sql` dentro de una
  transacción. Si detecta el esquema anterior, conserva los registros y migra
  nombres de columnas, estados y tipos monetarios.
- Cargar datos de prueba en una base vacía: `npm run db:seed`. El script se
  detiene si encuentra datos existentes y transforma las claves de ejemplo en
  hashes bcrypt mediante `pgcrypto`. No ejecutes el seed sobre una base poblada.

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
  `PUT /api/departments/:id` y `DELETE /api/departments/:id`. Las escrituras
  requieren un usuario ADMIN.
- `GET /api/cities?departamentoId=1`: consulta ciudades; el filtro es opcional.
- `GET /api/cities/:id`, `POST /api/cities`, `PUT /api/cities/:id` y
  `DELETE /api/cities/:id`. Las escrituras requieren un usuario ADMIN.
- Las escrituras de países también requieren un usuario ADMIN; las consultas de
  catálogos de ubicación son públicas para los formularios de registro y eventos.
- `GET /api/admin/reports?year=2026`: consulta los resúmenes y reportes
  disponibles para el año indicado; requiere token ADMIN y, si se omite el año,
  usa el año actual.
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
- `GET /api/reservations`: consulta reservas visibles al usuario del token (las
  propias para clientes, las de sus eventos para agentes y todas para ADMIN).
- `GET /api/reservations/:id`: consulta una reserva dentro del alcance del usuario
  autenticado (cliente o eventos del agente).
- `POST /api/reservations`: requiere token CLIENTE; la identificación se toma del
  token. Recibe `id_evento`, `entradas` y, opcionalmente, `observacion`.
- `PUT /api/reservations/:id`: permite al cliente modificar su reserva o cancelarla;
  el agente del evento puede cambiar su estado. `PATCH /api/reservations/:id/estado`
  es compatible para los cambios de estado de agentes y administradores.
- `DELETE /api/reservations/:id`: elimina una reserva dentro del alcance autorizado.

La creación y actualización de reservas bloquean el evento y comprueban los cupos
dentro de una transacción. Las reservas canceladas no ocupan capacidad. Las pruebas
de integración usan PostgreSQL y se ejecutan con `npm run test:reservations`.

Todos los GET de eventos y reservas requieren autenticación; los cambios de
estado requieren AGENTE o ADMIN. Los eventos se devuelven con los campos que consume Angular (`codigo`,
`identificacion`, `id_ciudad`, `observaciones` y estados legibles). Angular
muestra fechas calendario; el esquema conserva timestamps para la hora del
evento y los eventos de un solo día finalizan al cierre de ese día.

Los endpoints de ubicación devuelven objetos con los nombres de las columnas de
la base (`id`, `nombre`, `id_pais` e `id_departamento`). El borrado de una
ubicación devuelve `409 Conflict` si existen registros dependientes, para evitar
que el `ON DELETE CASCADE` del esquema elimine personas, eventos o ubicaciones
asociadas.

El reporte mensual de ingresos incluye reservas confirmadas y se agrupa por la
fecha de reserva. Los promedios de agente y cliente se calculan sobre las
reservas confirmadas del año consultado. Las causas de cancelación usan
`causa_cancelacion` y recurren a `observacion` si no existe una causa específica.

Los servicios Angular usan `http://localhost:3000/api` por defecto. La URL se
puede reemplazar con el token `API_BASE_URL`.
La gestión de cuentas y reportes ya está integrada en el contenedor
administrativo; la gestión de ubicaciones conserva su componente existente.
