import { Request, Response } from "express";
import { HandleError } from "../../../domain/errors/handle.error";
import { EventsService } from "./events.service";
import { currentUser } from "../../middleware/auth.middleware";

export class EventsController {
  private readonly eventsService = new EventsService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = currentUser(req);
      res.status(200).json(await this.eventsService.getAll(user.rol, user.identificacion));
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = currentUser(req);
      res.status(200).json(
        await this.eventsService.getManagedById(req.params.id, user.identificacion, user.rol)
      );
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = currentUser(req);
      res.status(201).json(await this.eventsService.create(req.body, user.identificacion));
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = currentUser(req);
      res.status(200).json(await this.eventsService.update(req.params.id, req.body, user.identificacion));
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.eventsService.delete(req.params.id, currentUser(req).identificacion);
      res.status(204).send();
    } catch (error) {
      HandleError.error(error, res);
    }
  };
}
