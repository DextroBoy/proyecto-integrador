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
    num_identificacion VARCHAR(20) PRIMARY KEY,
    tipo_identificacion VARCHAR(20) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    direccion VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    id_ciudad INTEGER NOT NULL,

    CONSTRAINT chk_tipo_identificacion CHECK (tipo_identificacion IN ('CC', 'CE', 'TI', 'PAS', 'NIT')),
    CONSTRAINT chk_rol_persona CHECK (rol IN ('ADMIN', 'CLIENTE', 'AGENTE')),
    CONSTRAINT uq_persona_identificacion_rol UNIQUE (num_identificacion, rol), 
    CONSTRAINT fk_persona_ciudad FOREIGN KEY (id_ciudad) REFERENCES ciudad(id)
);


CREATE TABLE IF NOT EXISTS persona_telefono (
    num_identificacion VARCHAR(20) NOT NULL,
    telefono VARCHAR(20) NOT NULL,

    CONSTRAINT pk_persona_telefono PRIMARY KEY (num_identificacion, telefono),
    CONSTRAINT fk_telefono_persona FOREIGN KEY (num_identificacion) REFERENCES persona(num_identificacion) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cliente (
    num_identificacion VARCHAR(20) PRIMARY KEY,
    rol VARCHAR(20) NOT NULL DEFAULT 'CLIENTE',
    puntos INTEGER NOT NULL DEFAULT 0,
    publicidad BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_cliente_rol CHECK (rol = 'CLIENTE'),
    CONSTRAINT fk_cliente_persona FOREIGN KEY (num_identificacion, rol)
        REFERENCES persona(num_identificacion, rol) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agente (
    num_identificacion VARCHAR(20) PRIMARY KEY,
    rol VARCHAR(20) NOT NULL DEFAULT 'AGENTE',
    comision NUMERIC(7,2) NOT NULL DEFAULT 0,
    experiencia VARCHAR(100),

    CONSTRAINT chk_agente_rol CHECK (rol = 'AGENTE'),
    CONSTRAINT fk_agente_persona FOREIGN KEY (num_identificacion, rol)
        REFERENCES persona(num_identificacion, rol) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin (
    num_identificacion VARCHAR(20) PRIMARY KEY,
    rol VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    salario NUMERIC(10,2) NOT NULL DEFAULT 0,
    horario VARCHAR(100),

    CONSTRAINT chk_admin_rol CHECK (rol = 'ADMIN'),
    CONSTRAINT fk_admin_persona FOREIGN KEY (num_identificacion, rol)
        REFERENCES persona(num_identificacion, rol) ON DELETE CASCADE
);

ALTER TABLE admin ALTER COLUMN salario TYPE NUMERIC(10,2);


CREATE TABLE IF NOT EXISTS estado_evento (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS estado_reserva (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO estado_evento (nombre) VALUES
    ('PROGRAMADO'), ('BOLETERIA'), ('VIVO'), ('FINALIZADO'), ('CANCELADO')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO estado_reserva (nombre) VALUES
    ('RESERVADA'), ('CONFIRMADA'), ('CANCELADA')
ON CONFLICT (nombre) DO NOTHING;

CREATE TABLE IF NOT EXISTS evento (
    id SERIAL PRIMARY KEY,
    num_identificacion VARCHAR(20) NOT NULL,               
    id_ciudad INTEGER NOT NULL,
    id_estado INTEGER NOT NULL,                       
    nombre VARCHAR(100) NOT NULL,
    teatro VARCHAR(100),
    capacidad INTEGER,
    descripcion TEXT,
    precio NUMERIC(12,2),
    fecha_hora_inicio TIMESTAMP,                       
    fecha_hora_fin_estimada TIMESTAMP,                
    observacion TEXT,
    causa_cancelacion TEXT,                            

    CONSTRAINT chk_evento_capacidad CHECK (capacidad IS NULL OR capacidad > 0),
    CONSTRAINT chk_evento_precio CHECK (precio IS NULL OR precio >= 0),
    CONSTRAINT chk_evento_fechas CHECK (fecha_hora_fin_estimada IS NULL OR fecha_hora_inicio IS NULL  OR fecha_hora_fin_estimada > fecha_hora_inicio),
    CONSTRAINT fk_evento_agente FOREIGN KEY (num_identificacion) REFERENCES agente(num_identificacion),
    CONSTRAINT fk_evento_ciudad FOREIGN KEY (id_ciudad) REFERENCES ciudad(id),
    CONSTRAINT fk_evento_estado FOREIGN KEY (id_estado) REFERENCES estado_evento(id)
);

CREATE TABLE IF NOT EXISTS reserva (
    id SERIAL PRIMARY KEY,
    num_identificacion VARCHAR(20) NOT NULL,             
    id_evento INTEGER NOT NULL,
    id_estado INTEGER NOT NULL,                        
    fecha_hora_reserva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(12,2),
    entradas INTEGER,
    observacion TEXT,
    causa_cancelacion TEXT,

    CONSTRAINT chk_reserva_entradas CHECK (entradas IS NULL OR entradas > 0),
    CONSTRAINT chk_reserva_total CHECK (total IS NULL OR total >= 0),
    CONSTRAINT fk_reserva_cliente FOREIGN KEY (num_identificacion) REFERENCES cliente(num_identificacion) ON DELETE CASCADE,
    CONSTRAINT fk_reserva_evento FOREIGN KEY (id_evento) REFERENCES evento(id) ON DELETE CASCADE,
    CONSTRAINT fk_reserva_estado FOREIGN KEY (id_estado) REFERENCES estado_reserva(id)
);