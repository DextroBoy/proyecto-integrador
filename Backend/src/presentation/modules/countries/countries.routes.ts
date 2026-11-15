import { Router } from "express";
import { CountriesController } from "./countries.controller";

export class CountriesRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new CountriesController();

    router.get("/", controller.getAll);
    router.get("/:id", controller.getById);
    router.post("/", controller.create);
    router.put("/:id", controller.update);
    router.delete("/:id", controller.delete);

    return router;
  }
}
