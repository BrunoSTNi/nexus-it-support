import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './modules/auth/auth.routes';
import { categoryRoutes } from './modules/categories/category.routes';
import { ticketRoutes } from './modules/tickets/ticket.routes';
import { aiRoutes } from './modules/ai/ai.routes';
import { prisma } from './config/prisma';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Registrando rotas modulares existentes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/ai', aiRoutes);

// 📚 Rota de Artigos (Base de Conhecimento)
// 📚 Rota GET: Busca no banco PostgreSQL com fallback seguro
app.get('/api/articles', async (req, res) => {
  try {
    // Tenta buscar do banco real via Prisma
    const articles = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: articles });
  } catch (error: any) {
    // Fallback de segurança caso a tabela ainda não esteja criada no banco
    console.warn("Aviso: Banco de artigos indisponível, retornando dados de apoio.", error.message);
    const mockArticles = [
      {
        id: "1",
        title: "Como resolver erro de impressora offline",
        category: "Impressoras",
        summary: "Passo a passo para reiniciar o spooler de impressão e reconectar o dispositivo na rede.",
      },
      {
        id: "2",
        title: "Configuração de Rede VPN Corporativa",
        category: "Rede",
        summary: "Guia rápido para acesso remoto seguro utilizando as credenciais de domínio.",
      }
    ];
    return res.json({ success: true, data: mockArticles });
  }
});

app.post('/api/articles', async (req, res) => {
  try {
    const { title, category, summary, content } = req.body;
    if (!title || !summary) {
      return res.status(400).json({ success: false, message: "Título e resumo são obrigatórios." });
    }
    const newArticle = await prisma.article.create({
      data: { title, category: category || "Geral", summary, content: content || summary },
    });
    return res.status(201).json({ success: true, data: newArticle });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 🤖 Rota de Diagnóstico IA (/api/ai/diagnose)
app.post('/api/ai/diagnose', async (req, res) => {
  try {
    const { description } = req.body;
    // Resposta estruturada para o painel de diagnóstico da IA
    return res.json({
      success: true,
      data: {
        causes: [
          { title: "Falha de comunicação no dispositivo", confidence: 88, level: "Alta" },
          { title: "Problema de conexão de rede ou cabo", confidence: 65, level: "Média" },
          { title: "Serviço em segundo plano travado", confidence: 58, level: "Média" },
          { title: "Incompatibilidade de driver ou versão", confidence: 32, level: "Baixa" }
        ],
        procedures: [
          { id: 1, text: "Verificar conexão física ou de rede do dispositivo", checked: false },
          { id: 2, text: "Testar conectividade (ping) no endereço IP configurado", checked: false },
          { id: 3, text: "Verificar estado atual na fila de processamento", checked: false },
          { id: 4, text: "Reiniciar o serviço principal do sistema operacional", checked: false },
          { id: 5, text: "Executar teste funcional de validação", checked: false }
        ]
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 👥 Rota de Usuários (/api/users)
app.get('/api/users', async (req, res) => {
  try {
    // Se você tiver o model User no Prisma, pode buscar: await prisma.user.findMany();
    // Retornando mock estruturado compatível com a tela de Usuários
    const mockUsers = [
      { id: "1", name: "João da Silva", email: "joao.silva@empresa.com", role: "Usuário", status: "Ativo", lastAccess: "Agora" },
      { id: "2", name: "Carlos Oliveira", email: "carlos.oliveira@empresa.com", role: "Técnico", status: "Ativo", lastAccess: "Há 12 min" },
      { id: "3", name: "Mariana Costa", email: "mariana.costa@empresa.com", role: "Técnico", status: "Ativo", lastAccess: "Há 30 min" },
      { id: "4", name: "Ana Souza", email: "ana.souza@empresa.com", role: "Administrador", status: "Ativo", lastAccess: "Há 1 hora" },
      { id: "5", name: "Pedro Santos", email: "pedro.santos@empresa.com", role: "Usuário", status: "Inativo", lastAccess: "Há 2 dias" },
    ];
    return res.json({ success: true, data: mockUsers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      role: role || "Usuário",
      status: status || "Ativo",
      lastAccess: "Agora",
    };
    return res.status(201).json({ success: true, data: newUser });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'NEXUS API is running' });
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:${PORT}`);
});