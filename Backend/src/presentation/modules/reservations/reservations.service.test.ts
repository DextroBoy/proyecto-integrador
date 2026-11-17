import assert from "node:assert/strict";
import { after, afterEach, beforeEach, test } from "node:test";
import { pool } from "../../../config/database";
import { CustomError } from "../../../domain/errors/custom.error";
import { ReservationActor } from "./reservations.model";
import { ReservationsService } from "./reservations.service";

interface Fixture {
  clients: [number, number];
  agents: [number, number];
  events: [number, number];
  countryId: number;
}

const service = new ReservationsService();
let fixture: Fixture | undefined;

async function createFixture(): Promise<Fixture> {
  const firstId = 900000000 + Math.floor(Math.random() * 100000000);
  const clients: [number, number] = [firstId, firstId + 1];
  const agents: [number, number] = [firstId + 2, firstId + 3];
  const events: number[] = [];
  let countryId = 0;

  try {
    await pool.query(
      `INSERT INTO estado_reserva (nombre) VALUES ('RESERVADA'), ('CONFIRMADA'), ('CANCELADA')
       ON CONFLICT (nombre) DO NOTHING;`
    );
    await pool.query(
      `INSERT INTO estado_evento (nombre)
       VALUES ('PROGRAMADO'), ('BOLETERIA'), ('VIVO'), ('FINALIZADO'), ('CANCELADO')
       ON CONFLICT (nombre) DO NOTHING;`
    );
    const country = await pool.query<{ id: number }>(
      "INSERT INTO pais (nombre) VALUES ($1) RETURNING id;",
      [`Reservas test ${firstId}`]
    );
    countryId = country.rows[0]!.id;
    const department = await pool.query<{ id: number }>(
      "INSERT INTO departamento (id_pais, nombre) VALUES ($1, $2) RETURNING id;",
      [countryId, `Departamento test ${firstId}`]
    );
    const city = await pool.query<{ id: number }>(
      "INSERT INTO ciudad (id_departamento, nombre) VALUES ($1, $2) RETURNING id;",
      [department.rows[0]!.id, `Ciudad test ${firstId}`]
    );
    const cityId = city.rows[0]!.id;

    for (const [index, id] of [...clients, ...agents].entries()) {
      const role = index < 2 ? "CLIENTE" : "AGENTE";
      await pool.query(
        `INSERT INTO persona (
           num_identificacion, tipo_identificacion, nombre_completo, direccion,
           correo_electronico, contrasena, rol, id_ciudad
         )
         VALUES ($1, 'CC', $2, 'Dirección de prueba', $3, 'test', $4, $5);`,
        [id, `Prueba ${id}`, `reservas-${id}@example.test`, role, cityId]
      );
      await pool.query(
        `INSERT INTO ${role === "CLIENTE" ? "cliente" : "agente"} (num_identificacion)
         VALUES ($1);`,
        [id]
      );
    }

    const eventState = await pool.query<{ id: number }>(
      "SELECT id FROM estado_evento WHERE nombre = 'PROGRAMADO';"
    );
    for (const agentId of agents) {
      const result = await pool.query<{ id: number }>(
        `INSERT INTO evento (
           num_identificacion, id_ciudad, id_estado, nombre, teatro, capacidad,
           descripcion, precio, fecha_hora_inicio, fecha_hora_fin_estimada
         )
         VALUES ($1, $2, $3, 'Evento de prueba', 'Teatro de prueba', 4, 'Prueba',
                 1250.25, CURRENT_DATE + 10, CURRENT_DATE + 11)
         RETURNING id;`,
        [agentId, cityId, eventState.rows[0]!.id]
      );
      const eventId = result.rows[0]?.id;
      assert.ok(eventId);
      events.push(eventId);
    }
    return { clients, agents, events: [events[0]!, events[1]!], countryId };
  } catch (error) {
    await cleanup({
      clients,
      agents,
      events: [events[0] ?? 0, events[1] ?? 0],
      countryId,
    });
    throw error;
  }
}

async function cleanup(data: Fixture): Promise<void> {
  await pool.query("DELETE FROM evento WHERE id = ANY($1::integer[]);", [data.events]);
  await pool.query(
    "DELETE FROM persona WHERE num_identificacion = ANY($1::text[]);",
    [[...data.clients, ...data.agents].map(String)]
  );
  if (data.countryId > 0) {
    await pool.query("DELETE FROM pais WHERE id = $1;", [data.countryId]);
  }
}

function actor(identificacion: number, rol: ReservationActor["rol"]): ReservationActor {
  return { identificacion, rol };
}

function expectStatus(statusCode: number) {
  return (error: unknown): boolean =>
    error instanceof CustomError && error.statusCode === statusCode;
}

beforeEach(async () => {
  fixture = await createFixture();
});

afterEach(async () => {
  if (fixture) {
    await cleanup(fixture);
    fixture = undefined;
  }
});

after(async () => {
  await pool.end();
});

test("enforces capacity on create and update, recalculates totals, and releases cancelled seats", async () => {
  assert.ok(fixture);
  const [customerId] = fixture.clients;
  const [eventId] = fixture.events;
  const customer = actor(customerId, "CLIENTE");

  const reservation = await service.create({ id_evento: eventId, entradas: 3 }, customer);
  assert.equal(reservation.total, 3750.75);
  await assert.rejects(
    service.create({ id_evento: eventId, entradas: 2 }, customer),
    expectStatus(409)
  );
  await assert.rejects(
    service.update(reservation.codigo, { entradas: 5 }, customer),
    expectStatus(409)
  );

  const updated = await service.update(reservation.codigo, { entradas: 4 }, customer);
  assert.equal(updated.entradas, 4);
  assert.equal(updated.total, 5001);
  await service.update(reservation.codigo, { estado: "Cancelada" }, customer);

  const replacement = await service.create({ id_evento: eventId, entradas: 4 }, customer);
  assert.equal(replacement.entradas, 4);
});

test("serializes concurrent bookings against the event capacity", async () => {
  assert.ok(fixture);
  const [clientId] = fixture.clients;
  const [eventId] = fixture.events;
  const results = await Promise.allSettled([
    service.create({ id_evento: eventId, entradas: 3 }, actor(clientId, "CLIENTE")),
    service.create({ id_evento: eventId, entradas: 3 }, actor(clientId, "CLIENTE")),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  const rejected = results.find((result) => result.status === "rejected");
  assert.ok(rejected && rejected.status === "rejected");
  assert.ok(expectStatus(409)(rejected.reason));
});

test("filters reservations for the authenticated client and agent event ownership", async () => {
  assert.ok(fixture);
  const [firstClientId, secondClientId] = fixture.clients;
  const [firstAgentId, secondAgentId] = fixture.agents;
  const [firstEventId, secondEventId] = fixture.events;
  const firstCustomer = actor(firstClientId, "CLIENTE");

  const firstReservation = await service.create(
    { id_evento: firstEventId, entradas: 1 },
    firstCustomer
  );
  await service.create(
    { id_evento: firstEventId, entradas: 1 },
    actor(secondClientId, "CLIENTE")
  );
  await service.create(
    { id_evento: secondEventId, entradas: 1 },
    firstCustomer
  );

  const clientReservations = await service.getAll(firstCustomer);
  assert.equal(clientReservations.length, 2);
  assert.ok(clientReservations.every(({ cliente }) => cliente.identificacion === firstClientId));

  const firstAgentReservations = await service.getAll(actor(firstAgentId, "AGENTE"));
  assert.equal(firstAgentReservations.length, 2);
  assert.ok(firstAgentReservations.every(({ evento }) => evento.codigo === firstEventId));
  assert.equal((await service.getAll(actor(secondAgentId, "AGENTE"))).length, 1);
  await assert.rejects(
    service.getById(firstReservation.codigo, actor(secondClientId, "CLIENTE")),
    expectStatus(404)
  );
});

test("validates states, restricts agent updates, and permits scoped state changes", async () => {
  assert.ok(fixture);
  const [clientId] = fixture.clients;
  const [agentId, otherAgentId] = fixture.agents;
  const [eventId] = fixture.events;
  const reservation = await service.create(
    { id_evento: eventId, entradas: 1 },
    actor(clientId, "CLIENTE")
  );

  await assert.rejects(
    service.update(reservation.codigo, { estado: "PENDIENTE" }, actor(agentId, "AGENTE")),
    expectStatus(400)
  );
  await assert.rejects(
    service.update(reservation.codigo, { estado: "CONFIRMADA" }, actor(clientId, "CLIENTE")),
    expectStatus(403)
  );
  await assert.rejects(
    service.update(reservation.codigo, { entradas: 2 }, actor(agentId, "AGENTE")),
    expectStatus(400)
  );
  await assert.rejects(
    service.update(reservation.codigo, { estado: "CONFIRMADA" }, actor(otherAgentId, "AGENTE")),
    expectStatus(404)
  );

  const updated = await service.update(
    reservation.codigo,
    { estado: "CONFIRMADA" },
    actor(agentId, "AGENTE")
  );
  assert.equal(updated.estado, "Confirmada");
});

test("validates ticket counts and reports missing events", async () => {
  assert.ok(fixture);
  const [clientId] = fixture.clients;
  const customer = actor(clientId, "CLIENTE");
  await assert.rejects(
    service.create({ id_evento: fixture.events[0], entradas: 0 }, customer),
    expectStatus(400)
  );
  await assert.rejects(
    service.create({ id_evento: 2147483648, entradas: 1 }, customer),
    expectStatus(400)
  );
  await assert.rejects(
    service.create({ id_evento: 2147483647, entradas: 1 }, customer),
    expectStatus(404)
  );
  await assert.rejects(
    service.create(
      { id_evento: fixture.events[0], entradas: 1 },
      actor(2147483647, "CLIENTE")
    ),
    expectStatus(403)
  );
});

test("deletes only reservations visible to the acting client or event agent", async () => {
  assert.ok(fixture);
  const [clientId, otherClientId] = fixture.clients;
  const [agentId, otherAgentId] = fixture.agents;
  const [eventId] = fixture.events;
  const reservation = await service.create(
    { id_evento: eventId, entradas: 1 },
    actor(clientId, "CLIENTE")
  );

  await assert.rejects(
    service.delete(reservation.codigo, actor(otherClientId, "CLIENTE")),
    expectStatus(404)
  );
  await assert.rejects(
    service.delete(reservation.codigo, actor(otherAgentId, "AGENTE")),
    expectStatus(404)
  );
  await service.delete(reservation.codigo, actor(agentId, "AGENTE"));
  await assert.rejects(
    service.getById(reservation.codigo, actor(clientId, "CLIENTE")),
    expectStatus(404)
  );
});
