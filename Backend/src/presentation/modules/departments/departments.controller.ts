import { Request, Response } from "express";
import { HandleError } from "../../../domain/errors/handle.error";
import { DepartmentsService } from "./departments.service";

export class DepartmentsController {
  private readonly service = new DepartmentsService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.service.getAll(req.query.paisId));
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.service.getById(req.params.id));
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(201).json(await this.service.create(req.body));
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.service.update(req.params.id, req.body));
    } catch (error) {
      HandleError.error(error, res);
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      HandleError.error(error, res);
    }
  };
}
