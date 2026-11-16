import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { PersonController } from "./person.controller";

export class PersonRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new PersonController();
    router.use(requireAuth, requireRole("ADMIN"));
    router.get("/", controller.getAll); router.get("/:id", controller.getById);
    router.post("/", controller.create); router.put("/:id", controller.update); router.delete("/:id", controller.delete);
    return router;
  }
}