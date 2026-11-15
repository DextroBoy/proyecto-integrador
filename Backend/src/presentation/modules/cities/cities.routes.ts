import { Router } from "express";
import { CitiesController } from "./cities.controller";

export class CitiesRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new CitiesController();

    router.get("/", controller.getAll);
    router.get("/:id", controller.getById);
    router.post("/", controller.create);
    router.put("/:id", controller.update);
    router.delete("/:id", controller.delete);

    return router;
  }
}
