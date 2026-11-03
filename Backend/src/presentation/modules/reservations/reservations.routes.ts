import { Router } from "express";
import { ReservationsController } from "./reservations.controller";

export class ReservationsRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new ReservationsController();

    router.get("/", controller.getAll);
    router.post("/", controller.create);
    router.patch("/:id/estado", controller.updateState);

    return router;
  }
}
