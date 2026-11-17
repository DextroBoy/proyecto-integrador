INSERT INTO pais (nombre) VALUES
    ('Colombia'),
    ('México'),
    ('Argentina');

INSERT INTO departamento (id_pais, nombre) VALUES
-- Colombia
((SELECT id FROM pais WHERE nombre = 'Colombia'), 'Valle del Cauca'),
((SELECT id FROM pais WHERE nombre = 'Colombia'), 'Antioquia'),
((SELECT id FROM pais WHERE nombre = 'Colombia'), 'Cundinamarca'),
((SELECT id FROM pais WHERE nombre = 'Colombia'), 'Atlántico'),
((SELECT id FROM pais WHERE nombre = 'Colombia'), 'Bolívar'),
((SELECT id FROM pais WHERE nombre = 'Colombia'), 'Risaralda'),

-- México
((SELECT id FROM pais WHERE nombre = 'México'), 'Jalisco'),

-- Argentina
((SELECT id FROM pais WHERE nombre = 'Argentina'), 'Buenos Aires');

INSERT INTO ciudad (id_departamento, nombre) VALUES
-- Valle del Cauca
((SELECT d.id FROM departamento d JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Valle del Cauca'), 'Cali'),
((SELECT d.id FROM departamento d JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Valle del Cauca'), 'Palmira'),

-- Antioquia
((SELECT d.id FROM departamento d JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Antioquia'), 'Medellín'),
((SELECT d.id FROM departamento d JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Antioquia'), 'Envigado'),

-- Cundinamarca
((SELECT d.id FROM departamento d JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Cundinamarca'), 'Bogotá'),
((SELECT d.id FROM departamento d JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Cundinamarca'), 'Soacha'),

-- Atlántico
((SELECT d.id FROM departamento d JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Atlántico'), 'Barranquilla'),

-- Bolívar
((SELECT d.id FROM departamento d JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Bolívar'), 'Cartagena'),

-- Risaralda
((SELECT d.id FROM departamento d JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Risaralda'), 'Pereira'),

-- Jalisco
((SELECT d.id FROM departamento d JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'México' AND d.nombre = 'Jalisco'), 'Guadalajara');

INSERT INTO persona (
    num_identificacion,
    tipo_identificacion,
    nombre_completo,
    direccion,
    correo_electronico,
    contrasena,
    rol,
    id_ciudad
) VALUES
-- Administradores
('1001', 'CC', 'Carlos Ramírez', 'Calle 10 # 20-30', 'carlos@eventos.com', '123456', 'ADMIN', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Valle del Cauca' AND c.nombre = 'Cali')),
('1002', 'CC', 'Laura Gómez', 'Carrera 15 # 30-40', 'laura@eventos.com', '123456', 'ADMIN', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Antioquia' AND c.nombre = 'Medellín')),
('1003', 'CC', 'Andrés Torres', 'Calle 50 # 10-20', 'andres@eventos.com', '123456', 'ADMIN', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Cundinamarca' AND c.nombre = 'Bogotá')),

-- Agentes
('2001', 'CC', 'Daniel Martínez', 'Calle 5 # 10-15', 'daniel@eventos.com', '123456', 'AGENTE', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Valle del Cauca' AND c.nombre = 'Cali')),
('2002', 'CC', 'Mariana López', 'Carrera 20 # 15-25', 'mariana@eventos.com', '123456', 'AGENTE', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Antioquia' AND c.nombre = 'Medellín')),
('2003', 'CC', 'Sebastián Castro', 'Calle 80 # 12-30', 'sebastian@eventos.com', '123456', 'AGENTE', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Cundinamarca' AND c.nombre = 'Bogotá')),
('2004', 'CC', 'Valentina Ruiz', 'Carrera 8 # 40-50', 'valentina@eventos.com', '123456', 'AGENTE', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Atlántico' AND c.nombre = 'Barranquilla')),
('2005', 'CC', 'Felipe Herrera', 'Calle 25 # 15-20', 'felipe@eventos.com', '123456', 'AGENTE', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Bolívar' AND c.nombre = 'Cartagena')),

-- Clientes
('3001', 'CC', 'Juan Pérez', 'Calle 12 # 10-20', 'juan@gmail.com', '123456', 'CLIENTE', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Valle del Cauca' AND c.nombre = 'Cali')),
('3002', 'CC', 'Camila Rodríguez', 'Carrera 30 # 20-10', 'camila@gmail.com', '123456', 'CLIENTE', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Antioquia' AND c.nombre = 'Medellín')),
('3003', 'CC', 'Mateo Sánchez', 'Calle 45 # 15-30', 'mateo@gmail.com', '123456', 'CLIENTE', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Cundinamarca' AND c.nombre = 'Bogotá')),
('3004', 'CC', 'Isabella Moreno', 'Carrera 10 # 25-40', 'isabella@gmail.com', '123456', 'CLIENTE', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Atlántico' AND c.nombre = 'Barranquilla')),
('3005', 'CC', 'Santiago Díaz', 'Calle 20 # 30-15', 'santiago@gmail.com', '123456', 'CLIENTE', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Bolívar' AND c.nombre = 'Cartagena')),
('3006', 'CC', 'Sofía Vargas', 'Carrera 5 # 12-18', 'sofia@gmail.com', '123456', 'CLIENTE', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Valle del Cauca' AND c.nombre = 'Palmira')),
('3007', 'CC', 'Nicolás Jiménez', 'Calle 60 # 20-10', 'nicolas@gmail.com', '123456', 'CLIENTE', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Antioquia' AND c.nombre = 'Envigado')),
('3008', 'CC', 'Gabriela Rojas', 'Carrera 18 # 35-20', 'gabriela@gmail.com', '123456', 'CLIENTE', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Cundinamarca' AND c.nombre = 'Soacha')),
('3009', 'CC', 'Samuel Ortiz', 'Calle 40 # 10-30', 'samuel@gmail.com', '123456', 'CLIENTE', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Risaralda' AND c.nombre = 'Pereira')),
('3010', 'CC', 'Valeria Mendoza', 'Carrera 12 # 15-25', 'valeria@gmail.com', '123456', 'CLIENTE', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'México' AND d.nombre = 'Jalisco' AND c.nombre = 'Guadalajara'));

INSERT INTO cliente (num_identificacion, puntos, publicidad) VALUES
('3001', 150, TRUE),
('3002', 300, TRUE),
('3003', 50, FALSE),
('3004', 500, TRUE),
('3005', 100, FALSE),
('3006', 250, TRUE),
('3007', 75, TRUE),
('3008', 400, FALSE),
('3009', 0, TRUE),
('3010', 200, TRUE);

INSERT INTO agente (num_identificacion, comision, experiencia) VALUES
('2001', 10, '5 años de experiencia'),
('2002', 12, '3 años de experiencia'),
('2003', 8, '2 años de experiencia'),
('2004', 15, '7 años de experiencia'),
('2005', 10, '4 años de experiencia');

INSERT INTO admin (num_identificacion, salario, horario) VALUES
('1001', 5000000, 'Lunes a Viernes'),
('1002', 4500000, 'Lunes a Viernes'),
('1003', 5500000, 'Lunes a Sábado');

INSERT INTO evento (
    num_identificacion,
    id_ciudad,
    id_estado,
    nombre,
    teatro,
    capacidad,
    descripcion,
    precio,
    fecha_hora_inicio,
    fecha_hora_fin_estimada,
    observacion,
    causa_cancelacion
) VALUES

-- Eventos del agente 2001
( '2001', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Valle del Cauca' AND c.nombre = 'Cali'), (SELECT id FROM estado_evento WHERE nombre = 'PROGRAMADO'), 'Concierto de Rock',
 'Arena Cañaveralejo', 5000,
 'Una noche de rock con las mejores bandas nacionales.',
 120000, '2026-11-20 18:00:00', '2026-11-20 23:00:00',
 'Ingreso desde las 6 PM', NULL),

( '2001', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Valle del Cauca' AND c.nombre = 'Cali'), (SELECT id FROM estado_evento WHERE nombre = 'BOLETERIA'), 'Festival de Salsa',
 'Estadio Pascual Guerrero', 15000,
 'Festival de salsa con artistas nacionales e internacionales.',
 90000, '2026-12-10 18:00:00', '2026-12-10 23:59:00',
 'Evento para mayores de edad', NULL),

-- Eventos del agente 2002
( '2002', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Antioquia' AND c.nombre = 'Medellín'), (SELECT id FROM estado_evento WHERE nombre = 'BOLETERIA'), 'Concierto de Música Urbana',
 'La Macarena', 8000,
 'Presentación de artistas del género urbano.',
 150000, '2026-11-15 17:00:00', '2026-11-15 23:00:00',
 'Puertas abiertas desde las 5 PM', NULL),

( '2002', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Antioquia' AND c.nombre = 'Medellín'), (SELECT id FROM estado_evento WHERE nombre = 'PROGRAMADO'), 'Obra de Teatro',
 'Teatro Metropolitano', 1000,
 'Presentación de una obra de teatro contemporáneo.',
 60000, '2026-11-25 19:00:00', '2026-11-25 21:30:00',
 'Duración aproximada de dos horas', NULL),

-- Eventos del agente 2003
( '2003', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Cundinamarca' AND c.nombre = 'Bogotá'), (SELECT id FROM estado_evento WHERE nombre = 'VIVO'), 'Festival de Música Electrónica',
 'Movistar Arena', 10000,
 'Festival de música electrónica con DJs internacionales.',
 200000, '2026-11-03 18:00:00', '2026-11-03 23:59:00',
 'No se permite el ingreso de alimentos', NULL),

( '2003', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Cundinamarca' AND c.nombre = 'Bogotá'), (SELECT id FROM estado_evento WHERE nombre = 'FINALIZADO'), 'Concierto Sinfónico',
 'Teatro Colón', 1500,
 'Concierto de música clásica y sinfónica.',
 85000, '2026-10-15 19:00:00', '2026-10-15 22:00:00',
 'Vestimenta formal sugerida', NULL),

-- Eventos del agente 2004
( '2004', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Atlántico' AND c.nombre = 'Barranquilla'), (SELECT id FROM estado_evento WHERE nombre = 'PROGRAMADO'), 'Festival del Caribe',
 'Estadio Metropolitano', 12000,
 'Festival cultural y musical del Caribe colombiano.',
 75000, '2026-12-15 17:00:00', '2026-12-15 23:00:00',
 'Evento al aire libre', NULL),

( '2004', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Atlántico' AND c.nombre = 'Barranquilla'), (SELECT id FROM estado_evento WHERE nombre = 'PROGRAMADO'), 'Comedia en Vivo',
 'Teatro José Consuegra', 800,
 'Presentación de comediantes nacionales.',
 50000, '2026-12-05 19:00:00', '2026-12-05 21:00:00',
 'Ingreso permitido desde las 7 PM', NULL),

-- Eventos del agente 2005
( '2005', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Bolívar' AND c.nombre = 'Cartagena'), (SELECT id FROM estado_evento WHERE nombre = 'CANCELADO'), 'Concierto de Música Tropical',
 'Centro de Convenciones Cartagena', 3000,
 'Una noche de música tropical y baile.',
 110000, '2026-11-30 18:00:00', '2026-11-30 23:00:00',
 'Parqueadero disponible', 'Cancelacion administrativa del evento'),

( '2005', (SELECT c.id FROM ciudad c JOIN departamento d ON d.id = c.id_departamento JOIN pais p ON p.id = d.id_pais WHERE p.nombre = 'Colombia' AND d.nombre = 'Bolívar' AND c.nombre = 'Cartagena'), (SELECT id FROM estado_evento WHERE nombre = 'FINALIZADO'), 'Festival Gastronómico',
 'Plaza de la Aduana', 2000,
 'Experiencia gastronómica con restaurantes locales.',
 40000, '2026-10-20 10:00:00', '2026-10-20 18:00:00',
 'Incluye degustaciones', NULL);

INSERT INTO reserva (
    num_identificacion,
    id_evento,
    id_estado,
    fecha_hora_reserva,
    total,
    entradas,
    observacion,
    causa_cancelacion
) VALUES

-- Evento 1: Concierto de Rock
('3001', (SELECT id FROM evento WHERE num_identificacion = '2001' AND nombre = 'Concierto de Rock'), (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-20 10:00:00', 240000, 2, 'Reserva confirmada', NULL),
('3002', (SELECT id FROM evento WHERE num_identificacion = '2001' AND nombre = 'Concierto de Rock'), (SELECT id FROM estado_reserva WHERE nombre = 'RESERVADA'), '2026-10-21 10:00:00', 120000, 1, 'Pendiente de pago', NULL),
('3003', (SELECT id FROM evento WHERE num_identificacion = '2001' AND nombre = 'Concierto de Rock'), (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-22 10:00:00', 360000, 3, 'Pago realizado', NULL),

-- Evento 2: Festival de Salsa
('3004', (SELECT id FROM evento WHERE num_identificacion = '2001' AND nombre = 'Festival de Salsa'), (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-23 10:00:00', 180000, 2, 'Reserva confirmada', NULL),
('3005', (SELECT id FROM evento WHERE num_identificacion = '2001' AND nombre = 'Festival de Salsa'), (SELECT id FROM estado_reserva WHERE nombre = 'CANCELADA'), '2026-10-24 10:00:00', 90000, 1, 'Cancelada por el cliente', 'Cancelacion solicitada por el cliente'),
('3006', (SELECT id FROM evento WHERE num_identificacion = '2001' AND nombre = 'Festival de Salsa'), (SELECT id FROM estado_reserva WHERE nombre = 'RESERVADA'), '2026-10-25 10:00:00', 270000, 3, 'Pendiente de pago', NULL),

-- Evento 3: Concierto Urbano
('3007', (SELECT id FROM evento WHERE num_identificacion = '2002' AND nombre = 'Concierto de Música Urbana'), (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-26 10:00:00', 300000, 2, 'Pago realizado', NULL),
('3008', (SELECT id FROM evento WHERE num_identificacion = '2002' AND nombre = 'Concierto de Música Urbana'), (SELECT id FROM estado_reserva WHERE nombre = 'RESERVADA'), '2026-10-27 10:00:00', 150000, 1, 'Pendiente de confirmación', NULL),

-- Evento 4: Obra de Teatro
('3009', (SELECT id FROM evento WHERE num_identificacion = '2002' AND nombre = 'Obra de Teatro'), (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-28 10:00:00', 120000, 2, 'Reserva confirmada', NULL),
('3010', (SELECT id FROM evento WHERE num_identificacion = '2002' AND nombre = 'Obra de Teatro'), (SELECT id FROM estado_reserva WHERE nombre = 'CANCELADA'), '2026-10-29 10:00:00', 60000, 1, 'Cancelación solicitada', 'Cancelacion solicitada por el cliente'),

-- Evento 5: Festival Electrónico
('3001', (SELECT id FROM evento WHERE num_identificacion = '2003' AND nombre = 'Festival de Música Electrónica'), (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-30 10:00:00', 400000, 2, 'Pago realizado', NULL),
('3002', (SELECT id FROM evento WHERE num_identificacion = '2003' AND nombre = 'Festival de Música Electrónica'), (SELECT id FROM estado_reserva WHERE nombre = 'RESERVADA'), '2026-10-30 11:00:00', 200000, 1, 'Pendiente de pago', NULL),

-- Evento 7: Festival del Caribe
('3003', (SELECT id FROM evento WHERE num_identificacion = '2004' AND nombre = 'Festival del Caribe'), (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-31 10:00:00', 150000, 2, 'Reserva confirmada', NULL),
('3004', (SELECT id FROM evento WHERE num_identificacion = '2004' AND nombre = 'Festival del Caribe'), (SELECT id FROM estado_reserva WHERE nombre = 'RESERVADA'), '2026-11-01 10:00:00', 75000, 1, 'Pendiente de pago', NULL),

-- Evento 9: Concierto Tropical
('3005', (SELECT id FROM evento WHERE num_identificacion = '2005' AND nombre = 'Concierto de Música Tropical'), (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-15 10:00:00', 220000, 2, 'Reserva confirmada', NULL),
('3006', (SELECT id FROM evento WHERE num_identificacion = '2005' AND nombre = 'Concierto de Música Tropical'), (SELECT id FROM estado_reserva WHERE nombre = 'CANCELADA'), '2026-10-16 10:00:00', 110000, 1, 'Cancelación por parte del cliente', 'Cancelacion solicitada por el cliente'),

-- Evento 10: Festival Gastronómico
('3007', (SELECT id FROM evento WHERE num_identificacion = '2005' AND nombre = 'Festival Gastronómico'), (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-17 10:00:00', 80000, 2, 'Reserva confirmada', NULL);

INSERT INTO persona_telefono (num_identificacion, telefono) VALUES
('1001', '3001234567'),
('1002', '3002345678'),
('1003', '3003456789'),
('2001', '3004567890'),
('2002', '3005678901'),
('2003', '3006789012'),
('2004', '3007890123'),
('2005', '3008901234'),
('3001', '3009012345'),
('3002', '3010123456'),
('3003', '3011234567'),
('3004', '3012345678'),
('3005', '3013456789'),
('3006', '3014567890'),
('3007', '3015678901'),
('3008', '3016789012'),
('3009', '3017890123'),
('3010', '3018901234');