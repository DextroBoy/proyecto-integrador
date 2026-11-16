import { Router } from "express";
import { EventsController } from "./events.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";

export class EventsRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new EventsController();
    router.use(requireAuth);

    router.get("/", controller.getAll);
    router.get("/:id", controller.getById);
    router.post("/", requireRole("AGENTE"), controller.create);

    return router;
  }
}
