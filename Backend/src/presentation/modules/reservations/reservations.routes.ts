import { Router } from "express";
import { ReservationsController } from "./reservations.controller";

export class ReservationsRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new ReservationsController();

    router.get("/", controller.getAll);
    router.get("/:id", controller.getById);
    router.post("/", controller.create);
    router.put("/:id", controller.update);
    router.delete("/:id", controller.delete);
    router.patch("/:id/estado", controller.updateState);

    return router;
  }
}
