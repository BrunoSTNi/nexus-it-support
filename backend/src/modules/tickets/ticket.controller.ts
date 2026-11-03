import { Request, Response } from 'express';
import { TicketService } from './ticket.service';

const ticketService = new TicketService();

export class TicketController {
  async create(req: Request, res: Response) {
    try {
      const { description } = req.body;
      const requesterId = req.userId as string; // Garante para o TypeScript que é uma string

      if (!requesterId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const ticket = await ticketService.create(description, requesterId);
      return res.status(201).json({ success: true, data: ticket });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const tickets = await ticketService.findAll();
      return res.json({ success: true, data: tickets });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async addInteraction(req: Request, res: Response) {
    try {
      const id = req.params.id as string; // ID do chamado
      const { message } = req.body;
      const authorId = req.userId as string; // Padronizado com o create

      if (!authorId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }

      const interaction = await ticketService.addInteraction(id, authorId, message);
      return res.status(201).json({ success: true, data: interaction });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}