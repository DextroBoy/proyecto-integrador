import { Router } from "express";
import { AuthRoutes } from "./modules/auth/auth.routes";
import { CitiesRoutes } from "./modules/cities/cities.routes";
import { CountriesRoutes } from "./modules/countries/countries.routes";
import { DepartmentsRoutes } from "./modules/departments/departments.routes";
import { EventsRoutes } from "./modules/events/events.routes";
import { ExampleRoutes } from "./modules/example/example.routes";
import { ReservationsRoutes } from "./modules/reservations/reservations.routes";
import { ReportsRoutes } from "./modules/admin/reports/reports.routes";

export class AppRoutes {

  static get routes(): Router {
    const router = Router();
    const apiRouter = Router();

    // Definir rutas
    apiRouter.use("/auth", AuthRoutes.routes);
    apiRouter.use("/countries", CountriesRoutes.routes);
    apiRouter.use("/departments", DepartmentsRoutes.routes);
    apiRouter.use("/cities", CitiesRoutes.routes);
    apiRouter.use("/admin/reports", ReportsRoutes.routes);
    apiRouter.use("/events", EventsRoutes.routes);
    apiRouter.use("/reservations", ReservationsRoutes.routes);
    apiRouter.use("/example", ExampleRoutes.routes);

    router.use("/api", apiRouter);

    return router;
  }
}