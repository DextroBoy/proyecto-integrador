import { Request, Response } from "express";
import { HandleError } from "../../../domain/errors/handle.error";
import { CustomError } from "../../../domain/errors/custom.error";
import { ReservationActor, ReservationRole } from "./reservations.model";
import { ReservationsService } from "./reservations.service";

type AuthenticatedRequest = Request & {
  user?: {
    identificacion?: unknown;
    rol?: unknown;
  };
};

function actorFromRequest(req: Request): ReservationActor {
  const user = (req as AuthenticatedRequest).user;
  const identification = user?.identificacion;
  const role = typeof user?.rol === "string" ? user.rol.toUpperCase() : "";
  if (
    (typeof identification !== "number" && typeof identification !== "string") ||
    !Number.isSafeInteger(Number(identification)) ||
    Number(identification) < 1 ||
    !["CLIENTE", "AGENTE", "ADMIN"].includes(role)
  ) {
    throw CustomError.unAuthorized("Se requiere una sesión autenticada para gestionar reservas.");
  }
  return {
    identificacion: Number(identification),
    rol: role as ReservationRole,
  };
}

export class ReservationsController {
  private readonly reservationsService = new ReservationsService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.reservationsService.getAll(actorFromRequest(req)));
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(
        await this.reservationsService.getById(req.params.id, actorFromRequest(req))
      );
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(201).json(
        await this.reservationsService.create(req.body, actorFromRequest(req))
      );
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(
        await this.reservationsService.update(req.params.id, req.body, actorFromRequest(req))
      );
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  updateState = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(
        await this.reservationsService.update(
          req.params.id,
          { estado: req.body?.estado },
          actorFromRequest(req)
        )
      );
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.reservationsService.delete(req.params.id, actorFromRequest(req));
      res.status(204).send();
    } catch (error) {
      HandleError.error(error, res);
    }
  };
}
