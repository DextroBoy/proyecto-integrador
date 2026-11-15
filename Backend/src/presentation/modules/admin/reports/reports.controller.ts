import { Request, Response } from "express";
import { HandleError } from "../../../../domain/errors/handle.error";
import { ReportsService } from "./reports.service";

export class ReportsController {
  private readonly service = new ReportsService();

  getReports = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json(await this.service.getReports(req.query.year));
    } catch (error) {
      HandleError.error(error, res);
    }
  };
}
