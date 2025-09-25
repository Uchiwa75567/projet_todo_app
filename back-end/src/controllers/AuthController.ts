import { type Request, type Response } from "express";
import { UserService } from "../services/UserService.js";

class AuthController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

  register = async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const out = await this.service.register(name, email, password);
      res.status(201).json(out);
    } catch (e: any) {
      res.status(400).json({ error: e.message || "Bad request" });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const out = await this.service.login(email, password);
      res.json(out);
    } catch (e: any) {
      res.status(400).json({ error: e.message || "Bad request" });
    }
  };
}

export default new AuthController();
