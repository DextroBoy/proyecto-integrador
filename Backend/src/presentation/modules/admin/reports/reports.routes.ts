import { Router } from "express";
import { ReportsController } from "./reports.controller";
import { requireAuth, requireRole } from "../../../middleware/auth.middleware";

export class ReportsRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new ReportsController();
    router.use(requireAuth, requireRole("ADMIN"));

    router.get("/", controller.getReports);

    return router;
  }
}
