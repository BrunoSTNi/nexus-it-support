import { Router } from 'express';
import { AIController } from './ai.controller';
import { ensureAuthenticated } from '../../middlewares/auth.middleware';

const aiRoutes = Router();
const aiController = new AIController();

// Apenas usuários autenticados podem acionar a IA
aiRoutes.use(ensureAuthenticated);

aiRoutes.post('/classify', aiController.classify);

export { aiRoutes };