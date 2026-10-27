import { Router } from "express";
import { ExampleRoutes } from "./modules/example/example.routes";

export class AppRoutes {

  static get routes(): Router {
    const router = Router();
    const apiRouter = Router();

    // Definir rutas
    apiRouter.use("/example", ExampleRoutes.routes);

    router.use("/api", apiRouter);

    return router;
  }
}