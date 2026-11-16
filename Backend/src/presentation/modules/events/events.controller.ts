import { Request, Response } from "express";
import { HandleError } from "../../../domain/errors/handle.error";
import { EventsService } from "./events.service";
import { AuthenticatedRequest, UserRole } from "../../../domain/interfaces/auth.interface";
import { currentUser } from "../../middleware/auth.middleware";

export class EventsController {
  private readonly eventsService = new EventsService();

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.eventsService.getAll());
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.eventsService.getById(req.params.id));
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(201).json(await this.eventsService.create({ ...req.body, identificacion: currentUser(req).identificacion }));
    } catch (error) {
      HandleError.error(error, res);
    }
  };
}
