import { Router } from 'express';
import { CategoryController } from './category.controller';
import { ensureAuthenticated } from '../../middlewares/auth.middleware';

const categoryRoutes = Router();
const categoryController = new CategoryController();

// Apenas usuários logados (com token válido) podem acessar estas rotas
categoryRoutes.use(ensureAuthenticated);

categoryRoutes.post('/', categoryController.create);
categoryRoutes.get('/', categoryController.getAll);
categoryRoutes.patch('/:id', categoryController.update);

export { categoryRoutes };