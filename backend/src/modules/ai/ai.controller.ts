import { Request, Response } from 'express';
import { AIService } from './ai.service';

const aiService = new AIService();

export class AIController {
  async classify(req: Request, res: Response) {
    try {
      const { description } = req.body;
      if (!description) throw new Error('Descrição do problema é obrigatória');

      const classification = await AIService.classifyTicket(description);
      res.json({ success: true, data: classification });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}