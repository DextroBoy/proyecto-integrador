import { Request, Response } from "express";
import { HandleError } from "../../../domain/errors/handle.error";
import { ReservationsService } from "./reservations.service";
import { currentUser } from "../../middleware/auth.middleware";

export class ReservationsController {
  private readonly reservationsService = new ReservationsService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.reservationsService.getAll(req.query.cliente));
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(201).json(await this.reservationsService.create({ ...req.body, identificacion: currentUser(req).identificacion }));
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  updateState = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(
        await this.reservationsService.updateState(req.params.id, req.body?.estado)
      );
    } catch (error) {
      HandleError.error(error, res);
    }
  };
}
