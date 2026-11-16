import { Router } from "express";
import { ReportsController } from "./reports.controller";

export class ReportsRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new ReportsController();

    router.get("/", controller.getReports);

    return router;
  }
}
