import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { CountriesController } from "./countries.controller";

export class CountriesRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new CountriesController();

    router.get("/", controller.getAll);
    router.get("/:id", controller.getById);
    router.post("/", requireAuth, requireRole("ADMIN"), controller.create);
    router.put("/:id", requireAuth, requireRole("ADMIN"), controller.update);
    router.delete("/:id", requireAuth, requireRole("ADMIN"), controller.delete);

    return router;
  }
}
