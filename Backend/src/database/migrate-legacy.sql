CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  foreign_key RECORD;
BEGIN
  IF to_regclass('public.persona') IS NULL
     OR EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'persona'
         AND column_name = 'num_identificacion'
     ) THEN
    RETURN;
  END IF;

  FOR foreign_key IN
    SELECT conrelid::regclass AS table_name, conname
    FROM pg_constraint
    WHERE contype = 'f'
      AND conrelid IN (
        SELECT to_regclass(table_name)
        FROM unnest(ARRAY[
          'public.persona',
          'public.persona_telefono',
          'public.cliente',
          'public.agente',
          'public.admin',
          'public.evento',
          'public.reserva'
        ]) AS tables(table_name)
        WHERE to_regclass(table_name) IS NOT NULL
      )
  LOOP
    EXECUTE format(
      'ALTER TABLE %s DROP CONSTRAINT %I',
      foreign_key.table_name,
      foreign_key.conname
    );
  END LOOP;

  ALTER TABLE persona RENAME COLUMN identificacion TO num_identificacion;
  ALTER TABLE persona ALTER COLUMN num_identificacion TYPE VARCHAR(20)
    USING num_identificacion::text;
  ALTER TABLE persona RENAME COLUMN nombre TO nombre_completo;
  ALTER TABLE persona RENAME COLUMN email TO correo_electronico;
  ALTER TABLE persona RENAME COLUMN clave TO contrasena;
  ALTER TABLE persona ADD COLUMN tipo_identificacion VARCHAR(20) NOT NULL DEFAULT 'CC';

  ALTER TABLE cliente RENAME COLUMN identificacion TO num_identificacion;
  ALTER TABLE cliente ALTER COLUMN num_identificacion TYPE VARCHAR(20)
    USING num_identificacion::text;
  ALTER TABLE cliente ADD COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'CLIENTE';

  ALTER TABLE agente RENAME COLUMN identificacion TO num_identificacion;
  ALTER TABLE agente ALTER COLUMN num_identificacion TYPE VARCHAR(20)
    USING num_identificacion::text;
  ALTER TABLE agente ADD COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'AGENTE';
  ALTER TABLE agente ALTER COLUMN comision TYPE NUMERIC(7, 2)
    USING comision::numeric(7, 2);

  ALTER TABLE admin RENAME COLUMN identificacion TO num_identificacion;
  ALTER TABLE admin ALTER COLUMN num_identificacion TYPE VARCHAR(20)
    USING num_identificacion::text;
  ALTER TABLE admin ADD COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'ADMIN';
  ALTER TABLE admin ALTER COLUMN salario TYPE NUMERIC(10, 2)
    USING salario::numeric(10, 2);

  IF to_regclass('public.persona_telefono') IS NOT NULL
  THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'persona_telefono'
        AND column_name = 'identificacion'
    ) THEN
      ALTER TABLE persona_telefono RENAME COLUMN identificacion TO num_identificacion;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'persona_telefono'
        AND column_name = 'num_identificacion'
    ) THEN
    ALTER TABLE persona_telefono ALTER COLUMN num_identificacion TYPE VARCHAR(20)
      USING num_identificacion::text;
    END IF;
  END IF;

  ALTER TABLE evento RENAME COLUMN identificacion TO num_identificacion;
  ALTER TABLE evento ALTER COLUMN num_identificacion TYPE VARCHAR(20)
    USING num_identificacion::text;
  ALTER TABLE evento RENAME COLUMN fecha_inicio TO fecha_hora_inicio;
  ALTER TABLE evento ALTER COLUMN fecha_hora_inicio TYPE TIMESTAMP
    USING fecha_hora_inicio::timestamp;
  ALTER TABLE evento RENAME COLUMN fecha_fin TO fecha_hora_fin_estimada;
  ALTER TABLE evento ALTER COLUMN fecha_hora_fin_estimada TYPE TIMESTAMP
    USING fecha_hora_fin_estimada::timestamp;
  UPDATE evento
  SET fecha_hora_fin_estimada = fecha_hora_inicio::date + TIME '23:59:59'
  WHERE fecha_hora_inicio IS NOT NULL
    AND fecha_hora_fin_estimada = fecha_hora_inicio;
  ALTER TABLE evento ADD COLUMN id_estado INTEGER;
  ALTER TABLE evento ADD COLUMN causa_cancelacion TEXT;

  ALTER TABLE reserva RENAME COLUMN identificacion TO num_identificacion;
  ALTER TABLE reserva ALTER COLUMN num_identificacion TYPE VARCHAR(20)
    USING num_identificacion::text;
  ALTER TABLE reserva RENAME COLUMN fecha TO fecha_hora_reserva;
  ALTER TABLE reserva ALTER COLUMN fecha_hora_reserva TYPE TIMESTAMP
    USING fecha_hora_reserva::timestamp;
  ALTER TABLE reserva ALTER COLUMN fecha_hora_reserva SET DEFAULT CURRENT_TIMESTAMP;
  ALTER TABLE reserva ADD COLUMN id_estado INTEGER;
  ALTER TABLE reserva ADD COLUMN causa_cancelacion TEXT;

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

  UPDATE evento e
  SET id_estado = se.id
  FROM estado_evento se
  WHERE se.nombre = CASE UPPER(REPLACE(TRIM(e.estado), ' ', '_'))
    WHEN 'EN_BOLETERIA' THEN 'BOLETERIA'
    WHEN 'EN_VIVO' THEN 'VIVO'
    ELSE UPPER(REPLACE(TRIM(e.estado), ' ', '_'))
  END;

  UPDATE reserva r
  SET id_estado = sr.id
  FROM estado_reserva sr
  WHERE sr.nombre = UPPER(TRIM(r.estado));

  IF EXISTS (SELECT 1 FROM evento WHERE id_estado IS NULL)
     OR EXISTS (SELECT 1 FROM reserva WHERE id_estado IS NULL) THEN
    RAISE EXCEPTION 'No se pudieron convertir todos los estados de eventos y reservas.';
  END IF;
  IF EXISTS (SELECT 1 FROM reserva WHERE fecha_hora_reserva IS NULL) THEN
    RAISE EXCEPTION 'Hay reservas sin fecha de registro; deben corregirse antes de migrar.';
  END IF;

  ALTER TABLE evento DROP CONSTRAINT IF EXISTS chk_estado_evento;
  ALTER TABLE reserva DROP CONSTRAINT IF EXISTS chk_estado_reserva;
  ALTER TABLE evento DROP COLUMN estado;
  ALTER TABLE reserva DROP COLUMN estado;
  ALTER TABLE evento ALTER COLUMN id_estado SET NOT NULL;
  ALTER TABLE reserva ALTER COLUMN id_estado SET NOT NULL;
  ALTER TABLE reserva ALTER COLUMN fecha_hora_reserva SET NOT NULL;

  ALTER TABLE persona
    ADD CONSTRAINT uq_persona_identificacion_rol UNIQUE (num_identificacion, rol),
    ADD CONSTRAINT chk_tipo_identificacion
      CHECK (tipo_identificacion IN ('CC', 'CE', 'TI', 'PAS', 'NIT'));

  ALTER TABLE cliente
    ADD CONSTRAINT chk_cliente_rol CHECK (rol = 'CLIENTE'),
    ADD CONSTRAINT fk_cliente_persona
      FOREIGN KEY (num_identificacion, rol)
      REFERENCES persona (num_identificacion, rol) ON DELETE CASCADE;

  ALTER TABLE agente
    ADD CONSTRAINT chk_agente_rol CHECK (rol = 'AGENTE'),
    ADD CONSTRAINT fk_agente_persona
      FOREIGN KEY (num_identificacion, rol)
      REFERENCES persona (num_identificacion, rol) ON DELETE CASCADE;

  ALTER TABLE admin
    ADD CONSTRAINT chk_admin_rol CHECK (rol = 'ADMIN'),
    ADD CONSTRAINT fk_admin_persona
      FOREIGN KEY (num_identificacion, rol)
      REFERENCES persona (num_identificacion, rol) ON DELETE CASCADE;

  ALTER TABLE persona
    ADD CONSTRAINT fk_persona_ciudad FOREIGN KEY (id_ciudad) REFERENCES ciudad (id);

  IF to_regclass('public.persona_telefono') IS NOT NULL THEN
    ALTER TABLE persona_telefono
      ADD CONSTRAINT fk_telefono_persona
      FOREIGN KEY (num_identificacion) REFERENCES persona (num_identificacion)
      ON DELETE CASCADE;
  END IF;

  ALTER TABLE evento
    ADD CONSTRAINT fk_evento_agente
      FOREIGN KEY (num_identificacion) REFERENCES agente (num_identificacion),
    ADD CONSTRAINT fk_evento_ciudad FOREIGN KEY (id_ciudad) REFERENCES ciudad (id),
    ADD CONSTRAINT fk_evento_estado FOREIGN KEY (id_estado) REFERENCES estado_evento (id),
    ADD CONSTRAINT chk_evento_capacidad CHECK (capacidad IS NULL OR capacidad > 0),
    ADD CONSTRAINT chk_evento_precio CHECK (precio IS NULL OR precio >= 0),
    ADD CONSTRAINT chk_evento_fechas CHECK (
      fecha_hora_fin_estimada IS NULL OR fecha_hora_inicio IS NULL
      OR fecha_hora_fin_estimada > fecha_hora_inicio
    );

  ALTER TABLE reserva
    ADD CONSTRAINT fk_reserva_cliente
      FOREIGN KEY (num_identificacion) REFERENCES cliente (num_identificacion)
      ON DELETE CASCADE,
    ADD CONSTRAINT fk_reserva_evento FOREIGN KEY (id_evento) REFERENCES evento (id)
      ON DELETE CASCADE,
    ADD CONSTRAINT fk_reserva_estado FOREIGN KEY (id_estado) REFERENCES estado_reserva (id),
    ADD CONSTRAINT chk_reserva_entradas CHECK (entradas IS NULL OR entradas > 0),
    ADD CONSTRAINT chk_reserva_total CHECK (total IS NULL OR total >= 0);

  CREATE UNIQUE INDEX IF NOT EXISTS uq_departamento_nombre
    ON departamento (id_pais, nombre);
  CREATE UNIQUE INDEX IF NOT EXISTS uq_ciudad_nombre
    ON ciudad (id_departamento, nombre);

  UPDATE persona
  SET contrasena = crypt(contrasena, gen_salt('bf', 12))
  WHERE contrasena NOT LIKE '$2%';
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'evento'
      AND column_name = 'precio'
      AND data_type <> 'numeric'
  ) THEN
    ALTER TABLE evento ALTER COLUMN precio TYPE NUMERIC(12, 2)
      USING precio::numeric(12, 2);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'reserva'
      AND column_name = 'total'
      AND data_type <> 'numeric'
  ) THEN
    ALTER TABLE reserva ALTER COLUMN total TYPE NUMERIC(12, 2)
      USING total::numeric(12, 2);
  END IF;
END
$$;
