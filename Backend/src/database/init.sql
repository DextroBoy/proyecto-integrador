CREATE TABLE IF NOT EXISTS pais (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS departamento (
    id SERIAL PRIMARY KEY,
    id_pais INTEGER NOT NULL,
    nombre VARCHAR(100) NOT NULL,

    CONSTRAINT uq_departamento_nombre UNIQUE (id_pais, nombre),
    CONSTRAINT fk_departamento_pais FOREIGN KEY (id_pais) REFERENCES pais(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ciudad (
    id SERIAL PRIMARY KEY,
    id_departamento INTEGER NOT NULL,
    nombre VARCHAR(100) NOT NULL,

    CONSTRAINT uq_ciudad_nombre UNIQUE (id_departamento, nombre),
    CONSTRAINT fk_ciudad_departamento FOREIGN KEY (id_departamento) REFERENCES departamento(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS persona (
    identificacion INTEGER PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    clave VARCHAR(100) NOT NULL,
    rol VARCHAR(100) NOT NULL,
    id_ciudad INTEGER NOT NULL,

    CONSTRAINT chk_rol_persona CHECK (rol IN ('ADMIN', 'CLIENTE', 'AGENTE')),
    CONSTRAINT fk_persona_ciudad FOREIGN KEY (id_ciudad) REFERENCES ciudad(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cliente (
    identificacion INTEGER PRIMARY KEY,
    puntos INTEGER DEFAULT 0,
    publicidad BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_cliente_persona FOREIGN KEY (identificacion) REFERENCES persona(identificacion) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agente (
    identificacion INTEGER PRIMARY KEY,
    comision INTEGER DEFAULT 0,
    experiencia VARCHAR(100),

    CONSTRAINT fk_cliente_persona FOREIGN KEY (identificacion) REFERENCES persona(identificacion) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin (
    identificacion INTEGER PRIMARY KEY,
    salario INTEGER DEFAULT 0,
    horario VARCHAR(100),

    CONSTRAINT fk_cliente_persona FOREIGN KEY (identificacion) REFERENCES persona(identificacion) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evento (
    id SERIAL PRIMARY KEY,
    identificacion INTEGER NOT NULL,
    id_ciudad INTEGER NOT NULL,
    nombre VARCHAR(100),
    teatro VARCHAR(100),
    capacidad INTEGER,
    descripcion TEXT,
    precio INTEGER,
    fecha_inicio DATE,
    fecha_fin DATE,
    observacion TEXT,
    estado VARCHAR(100),

    CONSTRAINT chk_estado_evento CHECK (estado IN ('PROGRAMADO', 'BOLETERIA', 'VIVO', 'FINALIZADO', 'CANCELADO')),
    CONSTRAINT fk_evento_agente FOREIGN KEY (identificacion) REFERENCES agente(identificacion),
    CONSTRAINT fk_evento_ciudad FOREIGN KEY (id_ciudad) REFERENCES ciudad(id)
);

CREATE TABLE IF NOT EXISTS reserva (
    id SERIAL PRIMARY KEY,
    identificacion INTEGER NOT NULL,
    id_evento INTEGER NOT NULL,
    estado VARCHAR(100) NOT NULL,
    fecha DATE,
    total INTEGER,
    entradas INTEGER,
    observacion TEXT,

    CONSTRAINT chk_estado_reserva CHECK (estado IN ('RESERVADA', 'CONFIRMADA', 'CANCELADA')),
    CONSTRAINT fk_reserva_cliente FOREIGN KEY (identificacion) REFERENCES cliente(identificacion) ON DELETE CASCADE,
    CONSTRAINT fk_reserva_evento FOREIGN KEY (id_evento) REFERENCES evento(id) ON DELETE CASCADE
);