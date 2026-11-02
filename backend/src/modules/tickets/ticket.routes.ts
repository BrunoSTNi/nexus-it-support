import { Router } from 'express';
import { TicketController } from './ticket.controller';
import { ensureAuthenticated } from '../../middlewares/auth.middleware';

const ticketRoutes = Router();
const ticketController = new TicketController();

// Todas as rotas de chamados precisam de autenticação
ticketRoutes.use(ensureAuthenticated);

ticketRoutes.post('/', ticketController.create);
ticketRoutes.get('/', ticketController.getAll);
ticketRoutes.post('/:id/interactions', ticketController.addInteraction);

export { ticketRoutes };