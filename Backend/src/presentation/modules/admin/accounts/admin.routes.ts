import { Router } from "express";
import { requireAuth, requireRole } from "../../../middleware/auth.middleware";
import { AdminController } from "./admin.controller";
export class AdminAccountRoutes { static get routes(): Router { const r = Router(); const c = new AdminController(); r.use(requireAuth, requireRole("ADMIN")); r.get("/", c.getAll); r.get("/:id", c.getById); r.post("/", c.create); r.put("/:id", c.update); r.delete("/:id", c.delete); return r; } }