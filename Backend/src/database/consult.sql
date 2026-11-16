-- Consultar la ubicación completa de las personas
SELECT
    p.identificacion,
    p.nombre,
    p.email,
    p.rol,
    c.nombre AS ciudad,
    d.nombre AS departamento,
    pa.nombre AS pais
FROM persona p
INNER JOIN ciudad c ON p.id_ciudad = c.id
INNER JOIN departamento d ON c.id_departamento = d.id
INNER JOIN pais pa ON d.id_pais = pa.id
ORDER BY p.rol, p.nombre;

-- Consultar los eventos con su agente y ubicacion
SELECT
    e.id,
    e.nombre AS evento,
    p.nombre AS agente,
    c.nombre AS ciudad,
    d.nombre AS departamento,
    pa.nombre AS pais,
    e.precio,
    e.capacidad,
    ee.nombre AS estado
FROM evento e
INNER JOIN agente a ON e.identificacion = a.identificacion
INNER JOIN persona p ON a.identificacion = p.identificacion
INNER JOIN ciudad c ON e.id_ciudad = c.id
INNER JOIN departamento d ON c.id_departamento = d.id
INNER JOIN pais pa ON d.id_pais = pa.id
INNER JOIN estado_evento ee ON e.id_estado = ee.id
ORDER BY e.id;

-- Consultar estadísticas de reservas por evento
SELECT
    e.id,
    e.nombre AS evento,
    COUNT(r.id) AS cantidad_reservas,
    COALESCE(SUM(
        CASE
            WHEN er.nombre <> 'CANCELADA' THEN r.entradas
            ELSE 0
        END
    ), 0) AS entradas_activas,
    COALESCE(SUM(
        CASE
            WHEN er.nombre = 'CONFIRMADA' THEN r.total
            ELSE 0
        END
    ), 0) AS ingresos_confirmados
FROM evento e
LEFT JOIN reserva r ON e.id = r.id_evento
LEFT JOIN estado_reserva er ON r.id_estado = er.id
GROUP BY e.id, e.nombre
ORDER BY e.id;