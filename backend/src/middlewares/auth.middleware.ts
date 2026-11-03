import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare namespace Express {
  export interface Request {
    userId?: string;
  }
}

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ success: false, message: 'Token não fornecido' });
    return;
  }

  const [, token] = (authHeader as string).split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id?: string; userId?: string; sub?: string };
    
    // Atribui o ID do usuário diretamente ao req.userId (suportando diferentes padrões de payload)
    req.userId = decoded.id || decoded.userId || decoded.sub;

    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Token inválido: ID do usuário ausente' });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
};