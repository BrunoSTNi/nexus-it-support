import { Router } from 'express';
import { TicketController } from './ticket.controller';
import { ensureAuthenticated } from '../../middlewares/auth.middleware';

const ticketRoutes = Router();
const ticketController = new TicketController();

// Todas as rotas de chamados precisam de autenticação
ticketRoutes.use(ensureAuthenticated);

ticketRoutes.post('/', ticketController.create);
ticketRoutes.get('/', ticketController.getAll);

ticketRoutes.get('/:id', ticketController.getById);                   // Busca detalhes de um chamado específico
ticketRoutes.post('/:id/interactions', ticketController.addInteraction); // Adiciona mensagem no chat
ticketRoutes.post('/:id/status', ticketController.updateStatus);         // Altera status (Assumir/Resolver)

export { ticketRoutes };