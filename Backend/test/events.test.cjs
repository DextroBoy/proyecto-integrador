process.env.PORT = "3000";
process.env.DB_HOST = "127.0.0.1";
process.env.DB_PORT = "5432";
process.env.DB_USER = "test";
process.env.DB_PASSWORD = "test";
process.env.DB_NAME = "test";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { EventsService } = require("../src/presentation/modules/events/events.service.ts");
const { CustomError } = require("../src/domain/errors/custom.error.ts");

const baseEvent = {
  id: 8,
  identificacion: 7001,
  id_ciudad: 13,
  nombre: "Festival",
  descripcion: "Música en vivo",
  teatro: "Auditorio",
  ciudad: "Cali",
  fecha_inicio: "2026-10-15",
  fecha_fin: "2026-10-16",
  capacidad: 500,
  precio: 85000,
  observacion: null,
  estado: "PROGRAMADO",
};

const validPayload = {
  identificacion: 9999,
  id_ciudad: 13,
  nombre: "Festival",
  descripcion: "Música en vivo",
  teatro: "Auditorio",
  fecha_inicio: "2026-10-15",
  fecha_fin: "2026-10-16",
  capacidad: 500,
  precio: 85000,
  estado: "Programado",
};

function createService(overrides = {}) {
  const model = {
    getAll: async () => [baseEvent],
    getById: async () => baseEvent,
    agentExists: async () => true,
    cityExists: async () => true,
    create: async (event) => ({ ...baseEvent, ...event }),
    update: async () => baseEvent,
    deleteIfUnused: async () => "deleted",
    ...overrides,
  };
  return { service: new EventsService(model), model };
}

test("event list is scoped to the authenticated agent", async () => {
  let agentFilter;
  const { service } = createService({
    getAll: async (agentId) => {
      agentFilter = agentId;
      return [baseEvent];
    },
  });

  await service.getAll("AGENTE", 7001);
  assert.equal(agentFilter, 7001);
  await service.getAll("CLIENTE", 3001);
  assert.equal(agentFilter, undefined);
});

test("create uses the authenticated agent ID, not an ID from the request body", async () => {
  let inserted;
  const { service } = createService({
    create: async (event) => {
      inserted = event;
      return { ...baseEvent, ...event };
    },
  });

  const event = await service.create(validPayload, 7001);
  assert.equal(inserted.identificacion, 7001);
  assert.equal(event.id_ciudad, 13);
});

test("accepts prices with MER precision and rejects prices beyond two decimals", async () => {
  let inserted;
  const { service } = createService({
    create: async (event) => {
      inserted = event;
      return { ...baseEvent, ...event };
    },
  });

  await service.create({ ...validPayload, precio: 85000.25 }, 7001);
  assert.equal(inserted.precio, 85000.25);
  await assert.rejects(
    service.create({ ...validPayload, precio: 85000.251 }, 7001),
    (error) => error instanceof CustomError && error.statusCode === 400,
  );
});

test("invalid dates and missing cities return clear client errors", async () => {
  const { service } = createService({ cityExists: async () => false });

  await assert.rejects(
    service.create({ ...validPayload, fecha_inicio: "2026-02-31" }, 7001),
    (error) => error instanceof CustomError && error.statusCode === 400,
  );
  await assert.rejects(
    service.create(validPayload, 7001),
    (error) => error instanceof CustomError && error.statusCode === 400
      && error.message.includes("ciudad"),
  );
});

test("agents cannot update another agent's event", async () => {
  const { service } = createService({
    getById: async () => ({ ...baseEvent, identificacion: 7002 }),
  });

  await assert.rejects(
    service.update(8, validPayload, 7001),
    (error) => error instanceof CustomError && error.statusCode === 403,
  );
});

test("missing events return 404 and events with reservations cannot be deleted", async () => {
  const missing = createService({ getById: async () => null }).service;
  await assert.rejects(
    missing.getManagedById(999, 7001, "CLIENTE"),
    (error) => error instanceof CustomError && error.statusCode === 404,
  );

  const reserved = createService({
    deleteIfUnused: async () => "has-reservations",
  }).service;
  await assert.rejects(
    reserved.delete(8, 7001),
    (error) => error instanceof CustomError && error.statusCode === 409,
  );
});
