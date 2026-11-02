import { Request, Response } from 'express';
import { TicketService } from './ticket.service';

const ticketService = new TicketService();

export class TicketController {
  async create(req: Request, res: Response) {
    try {
      const { title, description, categoryId } = req.body;
      const requesterId = (req as any).user.id; // Pega o ID do token JWT logado
      
      const ticket = await ticketService.create(title, description, categoryId, requesterId);
      res.status(201).json({ success: true, data: ticket });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const tickets = await ticketService.findAll();
      res.json({ success: true, data: tickets });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async addInteraction(req: Request, res: Response) {
    try {
      const { id } = req.params; // ID do chamado
      const { message } = req.body;
      const authorId = (req as any).user.id; // Autor da mensagem

      const interaction = await ticketService.addInteraction(id, authorId, message);
      res.status(201).json({ success: true, data: interaction });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}