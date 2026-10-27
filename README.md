# Proyecto Integrador

Aplicación web para consultar eventos y simular la creación de reservas. Está
construida con Angular 20, Angular Router, Bootstrap y Bootstrap Icons. El
proyecto incluye vistas para clientes, agentes y administradores, pero en este
estado varias de esas vistas son demostrativas y no están conectadas a un
servidor.

## Requisitos

- Node.js compatible con Angular 20.
- npm.

Las versiones concretas de Angular y del resto de dependencias están definidas
en [`package.json`](./package.json). Se incluye [`package-lock.json`](./package-lock.json)
para instalar las dependencias reproducibles.

## Instalación y ejecución

Desde la carpeta raíz del proyecto:

```bash
npm install
npm run start
```

El comando `npm run start` ejecuta `ng serve` y levanta el servidor de desarrollo.
Cuando termine de iniciar, abre [http://localhost:4200/](http://localhost:4200/)
en el navegador. La ruta raíz redirige automáticamente a `/login`.

## Rutas disponibles

| Ruta | Contenido |
| --- | --- |
| `/` | Redirección a `/login`. |
| `/login` | Formulario visual de inicio de sesión. |
| `/register` | Formulario visual de registro. |
| `/client` | Área de cliente; redirige a `/client/events`. |
| `/client/events` | Listado de eventos mock, evento destacado navegable y enlaces para reservar. |
| `/client/reservations` | Listado de reservas mock. |
| `/client/create-reservation/:id` | Detalle de un evento y formulario para crear una reserva de demostración. |
| `/client/create-reservation` | Redirección a `/client/events`. |
| `/admin` | Panel administrativo con reportes y tablas estáticas de ejemplo. |
| `/agent` | Área de agente; redirige a `/agent/events`. |
| `/agent/events` | Tabla estática de eventos registrados. |
| `/agent/create-event` | Formulario visual para registrar un evento. |
| `/agent/reservations` | Tabla estática para administrar reservas. |

Las rutas no tienen autenticación ni guards de acceso. Por lo tanto, se pueden
abrir directamente escribiendo la URL.

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
- Los cambios solo viven mientras la aplicación está abierta. Al recargar la
  página se restablecen los datos iniciales; no hay API, base de datos,
  persistencia en el navegador, pagos ni comprobación real de disponibilidad.
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

hola
