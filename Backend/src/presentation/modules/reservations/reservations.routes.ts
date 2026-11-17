import { Router } from "express";
import { ReservationsController } from "./reservations.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";

export class ReservationsRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new ReservationsController();
    router.use(requireAuth);

    router.get("/", controller.getAll);
    router.get("/:id", controller.getById);
    router.post("/", requireRole("CLIENTE"), controller.create);
    router.put("/:id", controller.update);
    router.delete("/:id", controller.delete);
    router.patch("/:id/estado", requireRole("AGENTE", "ADMIN"), controller.updateState);

    return router;
  }
}
