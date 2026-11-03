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
    nombre,
    direccion,
    email,
    clave,
    rol,
    id_ciudad
) VALUES
-- Administradores
(1001, 'Carlos Ramírez', 'Calle 10 # 20-30', 'carlos@eventos.com', '123456', 'ADMIN', 1),
(1002, 'Laura Gómez', 'Carrera 15 # 30-40', 'laura@eventos.com', '123456', 'ADMIN', 3),
(1003, 'Andrés Torres', 'Calle 50 # 10-20', 'andres@eventos.com', '123456', 'ADMIN', 5),

-- Agentes
(2001, 'Daniel Martínez', 'Calle 5 # 10-15', 'daniel@eventos.com', '123456', 'AGENTE', 1),
(2002, 'Mariana López', 'Carrera 20 # 15-25', 'mariana@eventos.com', '123456', 'AGENTE', 3),
(2003, 'Sebastián Castro', 'Calle 80 # 12-30', 'sebastian@eventos.com', '123456', 'AGENTE', 5),
(2004, 'Valentina Ruiz', 'Carrera 8 # 40-50', 'valentina@eventos.com', '123456', 'AGENTE', 7),
(2005, 'Felipe Herrera', 'Calle 25 # 15-20', 'felipe@eventos.com', '123456', 'AGENTE', 8),

-- Clientes
(3001, 'Juan Pérez', 'Calle 12 # 10-20', 'juan@gmail.com', '123456', 'CLIENTE', 1),
(3002, 'Camila Rodríguez', 'Carrera 30 # 20-10', 'camila@gmail.com', '123456', 'CLIENTE', 3),
(3003, 'Mateo Sánchez', 'Calle 45 # 15-30', 'mateo@gmail.com', '123456', 'CLIENTE', 5),
(3004, 'Isabella Moreno', 'Carrera 10 # 25-40', 'isabella@gmail.com', '123456', 'CLIENTE', 7),
(3005, 'Santiago Díaz', 'Calle 20 # 30-15', 'santiago@gmail.com', '123456', 'CLIENTE', 8),
(3006, 'Sofía Vargas', 'Carrera 5 # 12-18', 'sofia@gmail.com', '123456', 'CLIENTE', 2),
(3007, 'Nicolás Jiménez', 'Calle 60 # 20-10', 'nicolas@gmail.com', '123456', 'CLIENTE', 4),
(3008, 'Gabriela Rojas', 'Carrera 18 # 35-20', 'gabriela@gmail.com', '123456', 'CLIENTE', 6),
(3009, 'Samuel Ortiz', 'Calle 40 # 10-30', 'samuel@gmail.com', '123456', 'CLIENTE', 9),
(3010, 'Valeria Mendoza', 'Carrera 12 # 15-25', 'valeria@gmail.com', '123456', 'CLIENTE', 10);

INSERT INTO cliente (identificacion, puntos, publicidad) VALUES
(3001, 150, TRUE),
(3002, 300, TRUE),
(3003, 50, FALSE),
(3004, 500, TRUE),
(3005, 100, FALSE),
(3006, 250, TRUE),
(3007, 75, TRUE),
(3008, 400, FALSE),
(3009, 0, TRUE),
(3010, 200, TRUE);

INSERT INTO agente (identificacion, comision, experiencia) VALUES
(2001, 10, '5 años de experiencia'),
(2002, 12, '3 años de experiencia'),
(2003, 8, '2 años de experiencia'),
(2004, 15, '7 años de experiencia'),
(2005, 10, '4 años de experiencia');

INSERT INTO admin (identificacion, salario, horario) VALUES
(1001, 5000000, 'Lunes a Viernes'),
(1002, 4500000, 'Lunes a Viernes'),
(1003, 5500000, 'Lunes a Sábado');

INSERT INTO evento (
    identificacion,
    id_ciudad,
    nombre,
    teatro,
    capacidad,
    descripcion,
    precio,
    fecha_inicio,
    fecha_fin,
    observacion,
    estado
) VALUES

-- Eventos del agente 2001
(2001, 1, 'Concierto de Rock',
 'Arena Cañaveralejo', 5000,
 'Una noche de rock con las mejores bandas nacionales.',
 120000, '2026-11-20', '2026-11-20',
 'Ingreso desde las 6 PM', 'PROGRAMADO'),

(2001, 1, 'Festival de Salsa',
 'Estadio Pascual Guerrero', 15000,
 'Festival de salsa con artistas nacionales e internacionales.',
 90000, '2026-12-10', '2026-12-10',
 'Evento para mayores de edad', 'BOLETERIA'),

-- Eventos del agente 2002
(2002, 3, 'Concierto de Música Urbana',
 'La Macarena', 8000,
 'Presentación de artistas del género urbano.',
 150000, '2026-11-15', '2026-11-15',
 'Puertas abiertas desde las 5 PM', 'BOLETERIA'),

(2002, 3, 'Obra de Teatro',
 'Teatro Metropolitano', 1000,
 'Presentación de una obra de teatro contemporáneo.',
 60000, '2026-11-25', '2026-11-25',
 'Duración aproximada de dos horas', 'PROGRAMADO'),

-- Eventos del agente 2003
(2003, 5, 'Festival de Música Electrónica',
 'Movistar Arena', 10000,
 'Festival de música electrónica con DJs internacionales.',
 200000, '2026-11-03', '2026-11-03',
 'No se permite el ingreso de alimentos', 'VIVO'),

(2003, 5, 'Concierto Sinfónico',
 'Teatro Colón', 1500,
 'Concierto de música clásica y sinfónica.',
 85000, '2026-10-15', '2026-10-15',
 'Vestimenta formal sugerida', 'FINALIZADO'),

-- Eventos del agente 2004
(2004, 7, 'Festival del Caribe',
 'Estadio Metropolitano', 12000,
 'Festival cultural y musical del Caribe colombiano.',
 75000, '2026-12-15', '2026-12-15',
 'Evento al aire libre', 'PROGRAMADO'),

(2004, 7, 'Comedia en Vivo',
 'Teatro José Consuegra', 800,
 'Presentación de comediantes nacionales.',
 50000, '2026-12-05', '2026-12-05',
 'Ingreso permitido desde las 7 PM', 'PROGRAMADO'),

-- Eventos del agente 2005
(2005, 8, 'Concierto de Música Tropical',
 'Centro de Convenciones Cartagena', 3000,
 'Una noche de música tropical y baile.',
 110000, '2026-11-30', '2026-11-30',
 'Parqueadero disponible', 'CANCELADO'),

(2005, 8, 'Festival Gastronómico',
 'Plaza de la Aduana', 2000,
 'Experiencia gastronómica con restaurantes locales.',
 40000, '2026-10-20', '2026-10-20',
 'Incluye degustaciones', 'FINALIZADO');

INSERT INTO reserva (
    identificacion,
    id_evento,
    estado,
    fecha,
    total,
    entradas,
    observacion
) VALUES

-- Evento 1: Concierto de Rock
(3001, 1, 'CONFIRMADA', '2026-10-20', 240000, 2, 'Reserva confirmada'),
(3002, 1, 'RESERVADA', '2026-10-21', 120000, 1, 'Pendiente de pago'),
(3003, 1, 'CONFIRMADA', '2026-10-22', 360000, 3, 'Pago realizado'),

-- Evento 2: Festival de Salsa
(3004, 2, 'CONFIRMADA', '2026-10-23', 180000, 2, 'Reserva confirmada'),
(3005, 2, 'CANCELADA', '2026-10-24', 90000, 1, 'Cancelada por el cliente'),
(3006, 2, 'RESERVADA', '2026-10-25', 270000, 3, 'Pendiente de pago'),

-- Evento 3: Concierto Urbano
(3007, 3, 'CONFIRMADA', '2026-10-26', 300000, 2, 'Pago realizado'),
(3008, 3, 'RESERVADA', '2026-10-27', 150000, 1, 'Pendiente de confirmación'),

-- Evento 4: Obra de Teatro
(3009, 4, 'CONFIRMADA', '2026-10-28', 120000, 2, 'Reserva confirmada'),
(3010, 4, 'CANCELADA', '2026-10-29', 60000, 1, 'Cancelación solicitada'),

-- Evento 5: Festival Electrónico
(3001, 5, 'CONFIRMADA', '2026-10-30', 400000, 2, 'Pago realizado'),
(3002, 5, 'RESERVADA', '2026-10-30', 200000, 1, 'Pendiente de pago'),

-- Evento 7: Festival del Caribe
(3003, 7, 'CONFIRMADA', '2026-10-31', 150000, 2, 'Reserva confirmada'),
(3004, 7, 'RESERVADA', '2026-11-01', 75000, 1, 'Pendiente de pago'),

-- Evento 9: Concierto Tropical
(3005, 9, 'CONFIRMADA', '2026-10-15', 220000, 2, 'Reserva confirmada'),
(3006, 9, 'CANCELADA', '2026-10-16', 110000, 1, 'Cancelación por parte del cliente'),

-- Evento 10: Festival Gastronómico
(3007, 10, 'CONFIRMADA', '2026-10-17', 80000, 2, 'Reserva confirmada');