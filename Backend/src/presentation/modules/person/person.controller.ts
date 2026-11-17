import { Request, Response } from "express";
import { HandleError } from "../../../domain/errors/handle.error";
import { UserRole } from "../../../domain/interfaces/auth.interface";
import { PersonService } from "./person.service";

export class PersonController {
  constructor(private readonly role?: UserRole, private readonly service = new PersonService()) {}
  getAll = async (_req: Request, res: Response) => { try { res.json(await this.service.getAll(this.role)); } catch (e) { HandleError.error(e, res); } };
  getById = async (req: Request, res: Response) => { try { res.json(await this.service.getById(req.params.id, this.role)); } catch (e) { HandleError.error(e, res); } };
  create = async (req: Request, res: Response) => { try { res.status(201).json(await this.service.create(req.body, this.role ?? (req.body as { rol?: UserRole }).rol!)); } catch (e) { HandleError.error(e, res); } };
  update = async (req: Request, res: Response) => { try { res.json(await this.service.update(req.params.id, req.body, this.role ?? (req.body as { rol?: UserRole }).rol!)); } catch (e) { HandleError.error(e, res); } };
  delete = async (req: Request, res: Response) => { try { await this.service.delete(req.params.id, this.role ?? (req.body as { rol?: UserRole }).rol!); res.status(204).send(); } catch (e) { HandleError.error(e, res); } };
}