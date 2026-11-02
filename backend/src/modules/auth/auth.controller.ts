import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      const user = await authService.register(name, email, password, role);
      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  }
}