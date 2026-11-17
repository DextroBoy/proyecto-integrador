import "dotenv/config";
import { readFile } from "fs/promises";
import path from "path";
import { pool } from "../config/database";

async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  let transactionStarted = false;
  try {
    const databasePath = path.resolve(process.cwd(), "src/database");
    const migration = await readFile(path.join(databasePath, "migrate-legacy.sql"), "utf-8");
    const schema = await readFile(path.join(databasePath, "init.sql"), "utf-8");

    await client.query("BEGIN");
    transactionStarted = true;
    await client.query(migration);
    await client.query(schema);
    await client.query("COMMIT");
    transactionStarted = false;
    console.log("Tablas creadas correctamente");
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }
    console.error("Error al crear las tablas:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase();