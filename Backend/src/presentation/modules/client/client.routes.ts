import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { ClientController } from "./client.controller";
export class ClientRoutes { static get routes(): Router { const r = Router(); const c = new ClientController(); r.use(requireAuth, requireRole("ADMIN")); r.get("/", c.getAll); r.get("/:id", c.getById); r.post("/", c.create); r.put("/:id", c.update); r.delete("/:id", c.delete); return r; } }