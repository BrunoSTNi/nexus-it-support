import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ success: false, message: 'Token não fornecido' });
    return;
  }

  const [, token] = (authHeader as string).split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
};