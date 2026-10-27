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
