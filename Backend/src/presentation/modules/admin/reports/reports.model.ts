import { pool } from "../../../../config/database";

export interface ReportsSummary {
  clientes: number;
  agentes: number;
  administradores: number;
  reservas: number;
  eventos: number;
}

export interface MonthlyRevenue {
  mes: number;
  ingresos: number;
}

export interface EventReservationsByMonth {
  evento_id: number;
  evento: string | null;
  mes: number;
  reservas: number;
}

export interface AverageRevenue {
  identificacion: number;
  nombre: string;
  promedio_ingresos: number;
}

export interface EventsByAgentAndCity {
  agente: string;
  ciudad: string;
  eventos: number;
}

export interface EventLocation {
  evento: string;
  pais: string;
  departamento: string;
  ciudad: string;
}

export interface ReservationHistory {
  cliente: string;
  evento: string | null;
  fecha: string | null;
  entradas: number | null;
  estado: string;
}

export interface CanceledReservation {
  reserva_id: number;
  cliente: string;
  evento: string | null;
  causa: string | null;
}

export interface CanceledEvent {
  evento_id: number;
  evento: string | null;
  causa: string | null;
}

export class ReportsModel {
  async getSummary(): Promise<ReportsSummary> {
    const result = await pool.query<ReportsSummary>(`
      SELECT
        (SELECT COUNT(*)::integer FROM cliente) AS clientes,
        (SELECT COUNT(*)::integer FROM agente) AS agentes,
        (SELECT COUNT(*)::integer FROM admin) AS administradores,
        (SELECT COUNT(*)::integer FROM reserva) AS reservas,
        (SELECT COUNT(*)::integer FROM evento) AS eventos;
    `);
    const summary = result.rows[0];
    if (!summary) {
      throw new Error("No se pudieron consultar los totales del sistema.");
    }
    return summary;
  }

  async getMonthlyRevenue(year: number): Promise<MonthlyRevenue[]> {
    const result = await pool.query<MonthlyRevenue>(
      `SELECT EXTRACT(MONTH FROM r.fecha_hora_reserva)::integer AS mes,
              COALESCE(SUM(total), 0)::float8 AS ingresos
       FROM reserva r
       INNER JOIN estado_reserva sr ON sr.id = r.id_estado
       WHERE sr.nombre = 'CONFIRMADA'
         AND r.fecha_hora_reserva IS NOT NULL
         AND EXTRACT(YEAR FROM r.fecha_hora_reserva) = $1
       GROUP BY EXTRACT(MONTH FROM r.fecha_hora_reserva)
       ORDER BY mes;`,
      [year]
    );
    return result.rows;
  }

  async getEventReservationsByMonth(year: number): Promise<EventReservationsByMonth[]> {
    const result = await pool.query<EventReservationsByMonth>(
      `      SELECT e.id AS evento_id,
              e.nombre AS evento,
             EXTRACT(MONTH FROM r.fecha_hora_reserva)::integer AS mes,
              COUNT(r.id)::integer AS reservas
       FROM reserva r
       INNER JOIN evento e ON e.id = r.id_evento
      WHERE r.fecha_hora_reserva IS NOT NULL
        AND EXTRACT(YEAR FROM r.fecha_hora_reserva) = $1
      GROUP BY e.id, e.nombre, EXTRACT(MONTH FROM r.fecha_hora_reserva)
       ORDER BY e.nombre, mes;`,
      [year]
    );
    return result.rows;
  }

  async getAverageRevenueByAgent(year: number): Promise<AverageRevenue[]> {
    const result = await pool.query<AverageRevenue>(
      `SELECT a.num_identificacion::integer AS identificacion,
              p.nombre_completo AS nombre,
              COALESCE(AVG(r.total), 0)::float8 AS promedio_ingresos
       FROM agente a
       INNER JOIN persona p ON p.num_identificacion = a.num_identificacion
       LEFT JOIN evento e ON e.num_identificacion = a.num_identificacion
       LEFT JOIN reserva r
         ON r.id_evento = e.id
        AND r.id_estado = (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA')
        AND r.fecha_hora_reserva IS NOT NULL
        AND EXTRACT(YEAR FROM r.fecha_hora_reserva) = $1
       GROUP BY a.num_identificacion, p.nombre_completo
       ORDER BY p.nombre_completo;`,
      [year]
    );
    return result.rows;
  }

  async getAverageRevenueByClient(year: number): Promise<AverageRevenue[]> {
    const result = await pool.query<AverageRevenue>(
      `SELECT c.num_identificacion::integer AS identificacion,
              p.nombre_completo AS nombre,
              COALESCE(AVG(r.total), 0)::float8 AS promedio_ingresos
       FROM cliente c
       INNER JOIN persona p ON p.num_identificacion = c.num_identificacion
       LEFT JOIN reserva r
         ON r.num_identificacion = c.num_identificacion
        AND r.id_estado = (SELECT id FROM estado_reserva WHERE nombre = 'CONFIRMADA')
        AND r.fecha_hora_reserva IS NOT NULL
        AND EXTRACT(YEAR FROM r.fecha_hora_reserva) = $1
       GROUP BY c.num_identificacion, p.nombre_completo
       ORDER BY p.nombre_completo;`,
      [year]
    );
    return result.rows;
  }

  async getEventsByAgentAndCity(year: number): Promise<EventsByAgentAndCity[]> {
    const result = await pool.query<EventsByAgentAndCity>(
      `SELECT p.nombre_completo AS agente,
              c.nombre AS ciudad,
              COUNT(e.id)::integer AS eventos
       FROM evento e
       INNER JOIN agente a ON a.num_identificacion = e.num_identificacion
       INNER JOIN persona p ON p.num_identificacion = a.num_identificacion
       INNER JOIN ciudad c ON c.id = e.id_ciudad
       WHERE e.fecha_hora_inicio IS NULL
          OR EXTRACT(YEAR FROM e.fecha_hora_inicio) = $1
       GROUP BY p.nombre_completo, c.nombre
       ORDER BY p.nombre_completo, c.nombre;`,
      [year]
    );
    return result.rows;
  }

  async getEventsByLocation(year: number): Promise<EventLocation[]> {
    const result = await pool.query<EventLocation>(
      `SELECT e.nombre AS evento,
              pa.nombre AS pais,
              d.nombre AS departamento,
              c.nombre AS ciudad
       FROM evento e
       INNER JOIN ciudad c ON c.id = e.id_ciudad
       INNER JOIN departamento d ON d.id = c.id_departamento
       INNER JOIN pais pa ON pa.id = d.id_pais
       WHERE e.fecha_hora_inicio IS NULL
          OR EXTRACT(YEAR FROM e.fecha_hora_inicio) = $1
       ORDER BY pa.nombre, d.nombre, c.nombre, e.nombre;`,
      [year]
    );
    return result.rows;
  }

  async getReservationHistory(year: number): Promise<ReservationHistory[]> {
    const result = await pool.query<ReservationHistory>(
      `SELECT p.nombre_completo AS cliente,
              e.nombre AS evento,
              r.fecha_hora_reserva::text AS fecha,
              r.entradas,
              sr.nombre AS estado
       FROM reserva r
       INNER JOIN cliente c ON c.num_identificacion = r.num_identificacion
       INNER JOIN persona p ON p.num_identificacion = c.num_identificacion
       INNER JOIN evento e ON e.id = r.id_evento
       INNER JOIN estado_reserva sr ON sr.id = r.id_estado
       WHERE r.fecha_hora_reserva IS NULL
          OR EXTRACT(YEAR FROM r.fecha_hora_reserva) = $1
       ORDER BY r.fecha_hora_reserva DESC NULLS LAST, r.id DESC;`,
      [year]
    );
    return result.rows;
  }

  async getCanceledReservations(year: number): Promise<CanceledReservation[]> {
    const result = await pool.query<CanceledReservation>(
      `SELECT r.id AS reserva_id,
              p.nombre_completo AS cliente,
              e.nombre AS evento,
              COALESCE(r.causa_cancelacion, r.observacion) AS causa
       FROM reserva r
       INNER JOIN cliente c ON c.num_identificacion = r.num_identificacion
       INNER JOIN persona p ON p.num_identificacion = c.num_identificacion
       INNER JOIN evento e ON e.id = r.id_evento
       INNER JOIN estado_reserva sr ON sr.id = r.id_estado
       WHERE sr.nombre = 'CANCELADA'
         AND (r.fecha_hora_reserva IS NULL OR EXTRACT(YEAR FROM r.fecha_hora_reserva) = $1)
       ORDER BY r.fecha_hora_reserva DESC NULLS LAST, r.id DESC;`,
      [year]
    );
    return result.rows;
  }

  async getCanceledEvents(year: number): Promise<CanceledEvent[]> {
    const result = await pool.query<CanceledEvent>(
      `SELECT e.id AS evento_id,
              e.nombre AS evento,
              COALESCE(e.causa_cancelacion, e.observacion) AS causa
       FROM evento e
       INNER JOIN estado_evento se ON se.id = e.id_estado
       WHERE se.nombre = 'CANCELADO'
         AND (e.fecha_hora_inicio IS NULL OR EXTRACT(YEAR FROM e.fecha_hora_inicio) = $1)
       ORDER BY e.fecha_hora_inicio DESC NULLS LAST, e.id DESC;`,
      [year]
    );
    return result.rows;
  }
}
