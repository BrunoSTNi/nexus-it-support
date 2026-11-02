import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './modules/auth/auth.routes';
import { categoryRoutes } from './modules/categories/category.routes';
import { ticketRoutes } from './modules/tickets/ticket.routes'

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Registrando as rotas
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'NEXUS API is running' });
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:${PORT}`);
});