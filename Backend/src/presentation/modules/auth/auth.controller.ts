import { Request, Response } from "express";
import { HandleError } from "../../../domain/errors/handle.error";
import { AuthService } from "./auth.service";

export class AuthController {
  private readonly authService = new AuthService();

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body as {
        email?: unknown;
        password?: unknown;
      };

      const user = await this.authService.login(email, password);
      res.status(200).json(user);
    } catch (error) {
      HandleError.error(error, res);
    }
  };
}
