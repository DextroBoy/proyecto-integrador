import { Router } from "express";
import { DepartmentsController } from "./departments.controller";

export class DepartmentsRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new DepartmentsController();

    router.get("/", controller.getAll);
    router.get("/:id", controller.getById);
    router.post("/", controller.create);
    router.put("/:id", controller.update);
    router.delete("/:id", controller.delete);

    return router;
  }
}
