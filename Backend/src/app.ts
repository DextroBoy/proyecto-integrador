import { envs } from "./config/envs";
import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/server";

/**
 * Función principal que instancia y arranca el servidor.
 */
async function main(): Promise<void> {
  const server = new Server({
    port: envs.PORT,
    publicPath: envs.PUBLIC_PATH,
    routes: AppRoutes.routes,
    database: {
      dbPort: envs.DB_PORT,
      dbHost: envs.DB_HOST,
      dbName: envs.DB_NAME,
      dbUser: envs.DB_USER,
      dbPassword: envs.DB_PASSWORD
    }
  });
  await server.start();
}

/**
 * Ejecución inmediata de la función principal.
 *
 * @remarks
 * Se utiliza un IIFE (Immediately Invoked Function Expression)
 * para iniciar la aplicación automáticamente.
 */
(async () => {
  try {
    await main();
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error);
    process.exitCode = 1;
  }
})();