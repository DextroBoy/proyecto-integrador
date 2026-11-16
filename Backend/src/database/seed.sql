INSERT INTO pais (nombre) VALUES
    ('Colombia'),
    ('México'),
    ('Argentina');

INSERT INTO departamento (id_pais, nombre) VALUES
-- Colombia
(1, 'Valle del Cauca'),
(1, 'Antioquia'),
(1, 'Cundinamarca'),
(1, 'Atlántico'),
(1, 'Bolívar'),
(1, 'Risaralda'),

-- México
(2, 'Jalisco'),

-- Argentina
(3, 'Buenos Aires');

INSERT INTO ciudad (id_departamento, nombre) VALUES
-- Valle del Cauca
(1, 'Cali'),
(1, 'Palmira'),

-- Antioquia
(2, 'Medellín'),
(2, 'Envigado'),

-- Cundinamarca
(3, 'Bogotá'),
(3, 'Soacha'),

-- Atlántico
(4, 'Barranquilla'),

-- Bolívar
(5, 'Cartagena'),

-- Risaralda
(6, 'Pereira'),

-- Jalisco
(7, 'Guadalajara');

INSERT INTO persona (
    identificacion,
    tipo_identificacion,
    nombre,
    direccion,
    email,
    clave,
    rol,
    id_ciudad
) VALUES
-- Administradores
('1001', 'CC', 'Carlos Ramírez', 'Calle 10 # 20-30', 'carlos@eventos.com', '123456', 'ADMIN', 1),
('1002', 'CC', 'Laura Gómez', 'Carrera 15 # 30-40', 'laura@eventos.com', '123456', 'ADMIN', 3),
('1003', 'CC', 'Andrés Torres', 'Calle 50 # 10-20', 'andres@eventos.com', '123456', 'ADMIN', 5),

-- Agentes
('2001', 'CC', 'Daniel Martínez', 'Calle 5 # 10-15', 'daniel@eventos.com', '123456', 'AGENTE', 1),
('2002', 'CC', 'Mariana López', 'Carrera 20 # 15-25', 'mariana@eventos.com', '123456', 'AGENTE', 3),
('2003', 'CC', 'Sebastián Castro', 'Calle 80 # 12-30', 'sebastian@eventos.com', '123456', 'AGENTE', 5),
('2004', 'CC', 'Valentina Ruiz', 'Carrera 8 # 40-50', 'valentina@eventos.com', '123456', 'AGENTE', 7),
('2005', 'CC', 'Felipe Herrera', 'Calle 25 # 15-20', 'felipe@eventos.com', '123456', 'AGENTE', 8),

-- Clientes
('3001', 'CC', 'Juan Pérez', 'Calle 12 # 10-20', 'juan@gmail.com', '123456', 'CLIENTE', 1),
('3002', 'CC', 'Camila Rodríguez', 'Carrera 30 # 20-10', 'camila@gmail.com', '123456', 'CLIENTE', 3),
('3003', 'CC', 'Mateo Sánchez', 'Calle 45 # 15-30', 'mateo@gmail.com', '123456', 'CLIENTE', 5),
('3004', 'CC', 'Isabella Moreno', 'Carrera 10 # 25-40', 'isabella@gmail.com', '123456', 'CLIENTE', 7),
('3005', 'CC', 'Santiago Díaz', 'Calle 20 # 30-15', 'santiago@gmail.com', '123456', 'CLIENTE', 8),
('3006', 'CC', 'Sofía Vargas', 'Carrera 5 # 12-18', 'sofia@gmail.com', '123456', 'CLIENTE', 2),
('3007', 'CC', 'Nicolás Jiménez', 'Calle 60 # 20-10', 'nicolas@gmail.com', '123456', 'CLIENTE', 4),
('3008', 'CC', 'Gabriela Rojas', 'Carrera 18 # 35-20', 'gabriela@gmail.com', '123456', 'CLIENTE', 6),
('3009', 'CC', 'Samuel Ortiz', 'Calle 40 # 10-30', 'samuel@gmail.com', '123456', 'CLIENTE', 9),
('3010', 'CC', 'Valeria Mendoza', 'Carrera 12 # 15-25', 'valeria@gmail.com', '123456', 'CLIENTE', 10);

INSERT INTO cliente (identificacion, puntos, publicidad) VALUES
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

INSERT INTO agente (identificacion, comision, experiencia) VALUES
('2001', 10, '5 años de experiencia'),
('2002', 12, '3 años de experiencia'),
('2003', 8, '2 años de experiencia'),
('2004', 15, '7 años de experiencia'),
('2005', 10, '4 años de experiencia');

INSERT INTO admin (identificacion, salario, horario) VALUES
('1001', 5000000, 'Lunes a Viernes'),
('1002', 4500000, 'Lunes a Viernes'),
('1003', 5500000, 'Lunes a Sábado');

INSERT INTO evento (
    identificacion,
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
( '2001', 1, (SELECT id FROM estado_evento WHERE nombre = 'PROGRAMADO'), 'Concierto de Rock',
 'Arena Cañaveralejo', 5000,
 'Una noche de rock con las mejores bandas nacionales.',
 120000, '2026-11-20 18:00:00', '2026-11-20 23:00:00',
 'Ingreso desde las 6 PM', NULL),

( '2001', 1, (SELECT id FROM estado_evento WHERE nombre = 'BOLETERIA'), 'Festival de Salsa',
 'Estadio Pascual Guerrero', 15000,
 'Festival de salsa con artistas nacionales e internacionales.',
 90000, '2026-12-10 18:00:00', '2026-12-10 23:59:00',
 'Evento para mayores de edad', NULL),

-- Eventos del agente 2002
( '2002', 3, (SELECT id FROM estado_evento WHERE nombre = 'BOLETERIA'), 'Concierto de Música Urbana',
 'La Macarena', 8000,
 'Presentación de artistas del género urbano.',
 150000, '2026-11-15 17:00:00', '2026-11-15 23:00:00',
 'Puertas abiertas desde las 5 PM', NULL),

( '2002', 3, (SELECT id FROM estado_evento WHERE nombre = 'PROGRAMADO'), 'Obra de Teatro',
 'Teatro Metropolitano', 1000,
 'Presentación de una obra de teatro contemporáneo.',
 60000, '2026-11-25 19:00:00', '2026-11-25 21:30:00',
 'Duración aproximada de dos horas', NULL),

-- Eventos del agente 2003
( '2003', 5, (SELECT id FROM estado_evento WHERE nombre = 'VIVO'), 'Festival de Música Electrónica',
 'Movistar Arena', 10000,
 'Festival de música electrónica con DJs internacionales.',
 200000, '2026-11-03 18:00:00', '2026-11-03 23:59:00',
 'No se permite el ingreso de alimentos', NULL),

( '2003', 5, (SELECT id FROM estado_evento WHERE nombre = 'FINALIZADO'), 'Concierto Sinfónico',
 'Teatro Colón', 1500,
 'Concierto de música clásica y sinfónica.',
 85000, '2026-10-15 19:00:00', '2026-10-15 22:00:00',
 'Vestimenta formal sugerida', NULL),

-- Eventos del agente 2004
( '2004', 7, (SELECT id FROM estado_evento WHERE nombre = 'PROGRAMADO'), 'Festival del Caribe',
 'Estadio Metropolitano', 12000,
 'Festival cultural y musical del Caribe colombiano.',
 75000, '2026-12-15 17:00:00', '2026-12-15 23:00:00',
 'Evento al aire libre', NULL),

( '2004', 7, (SELECT id FROM estado_evento WHERE nombre = 'PROGRAMADO'), 'Comedia en Vivo',
 'Teatro José Consuegra', 800,
 'Presentación de comediantes nacionales.',
 50000, '2026-12-05 19:00:00', '2026-12-05 21:00:00',
 'Ingreso permitido desde las 7 PM', NULL),

-- Eventos del agente 2005
( '2005', 8, (SELECT id FROM estado_evento WHERE nombre = 'CANCELADO'), 'Concierto de Música Tropical',
 'Centro de Convenciones Cartagena', 3000,
 'Una noche de música tropical y baile.',
 110000, '2026-11-30 18:00:00', '2026-11-30 23:00:00',
 'Parqueadero disponible', 'Cancelacion administrativa del evento'),

( '2005', 8, (SELECT id FROM estado_evento WHERE nombre = 'FINALIZADO'), 'Festival Gastronómico',
 'Plaza de la Aduana', 2000,
 'Experiencia gastronómica con restaurantes locales.',
 40000, '2026-10-20 10:00:00', '2026-10-20 18:00:00',
 'Incluye degustaciones', NULL);

INSERT INTO reserva (
    identificacion,
    id_evento,
    id_estado,
    fecha_hora_reserva,
    total,
    entradas,
    observacion,
    causa_cancelacion
) VALUES

-- Evento 1: Concierto de Rock
('3001', 1, (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-20 10:00:00', 240000, 2, 'Reserva confirmada', NULL),
('3002', 1, (SELECT id FROM estado_reserva WHERE nombre = 'RESERVADA'), '2026-10-21 10:00:00', 120000, 1, 'Pendiente de pago', NULL),
('3003', 1, (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-22 10:00:00', 360000, 3, 'Pago realizado', NULL),

-- Evento 2: Festival de Salsa
('3004', 2, (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-23 10:00:00', 180000, 2, 'Reserva confirmada', NULL),
('3005', 2, (SELECT id FROM estado_reserva WHERE nombre = 'CANCELADA'), '2026-10-24 10:00:00', 90000, 1, 'Cancelada por el cliente', 'Cancelacion solicitada por el cliente'),
('3006', 2, (SELECT id FROM estado_reserva WHERE nombre = 'RESERVADA'), '2026-10-25 10:00:00', 270000, 3, 'Pendiente de pago', NULL),

-- Evento 3: Concierto Urbano
('3007', 3, (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-26 10:00:00', 300000, 2, 'Pago realizado', NULL),
('3008', 3, (SELECT id FROM estado_reserva WHERE nombre = 'RESERVADA'), '2026-10-27 10:00:00', 150000, 1, 'Pendiente de confirmación', NULL),

-- Evento 4: Obra de Teatro
('3009', 4, (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-28 10:00:00', 120000, 2, 'Reserva confirmada', NULL),
('3010', 4, (SELECT id FROM estado_reserva WHERE nombre = 'CANCELADA'), '2026-10-29 10:00:00', 60000, 1, 'Cancelación solicitada', 'Cancelacion solicitada por el cliente'),

-- Evento 5: Festival Electrónico
('3001', 5, (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-30 10:00:00', 400000, 2, 'Pago realizado', NULL),
('3002', 5, (SELECT id FROM estado_reserva WHERE nombre = 'RESERVADA'), '2026-10-30 11:00:00', 200000, 1, 'Pendiente de pago', NULL),

-- Evento 7: Festival del Caribe
('3003', 7, (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-31 10:00:00', 150000, 2, 'Reserva confirmada', NULL),
('3004', 7, (SELECT id FROM estado_reserva WHERE nombre = 'RESERVADA'), '2026-11-01 10:00:00', 75000, 1, 'Pendiente de pago', NULL),

-- Evento 9: Concierto Tropical
('3005', 9, (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-15 10:00:00', 220000, 2, 'Reserva confirmada', NULL),
('3006', 9, (SELECT id FROM estado_reserva WHERE nombre = 'CANCELADA'), '2026-10-16 10:00:00', 110000, 1, 'Cancelación por parte del cliente', 'Cancelacion solicitada por el cliente'),

-- Evento 10: Festival Gastronómico
('3007', 10, (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA'), '2026-10-17 10:00:00', 80000, 2, 'Reserva confirmada', NULL);